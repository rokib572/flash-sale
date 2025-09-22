import autocannon from 'autocannon';
import fs from 'fs';
import path from 'path';
import { makeUnsignedJwt } from './jwt.js';
import { loadEnv } from './env.js';
import { dockerUp, waitForHttpOk } from './docker.js';
import { runMigrations } from './migrate.js';
import { fetchUsers, loginUsers, countOrdersForProductSince } from './users.js';
import { seedData } from './seed.js';

type Mode = 'same-user' | 'distinct';

const cfg = loadEnv();
const URL = cfg.url;
let PRODUCT_ID = cfg.productId;
const CONNECTIONS = cfg.connections;
const DURATION = cfg.duration;
const MODE: Mode = cfg.mode || 'same-user';

const buildBaseUrl = () => URL.replace(/\/$/, '');
let tokens: string[] = [];
let userIdsForTokens: string[] = [];
const buildPickTokenAndUser = () => {
  if (tokens.length <= 1) return () => ({ token: tokens[0], userId: userIdsForTokens[0] });
  let idx = 0;
  return () => {
    const i = idx % tokens.length;
    const t = tokens[i];
    const u = userIdsForTokens[i];
    idx++;
    return { token: t, userId: u };
  };
};

const run = async () => {
  const full = process.argv.includes('--full');
  if (full) {
    console.log('Starting docker services...');
    await dockerUp(['postgres', 'redis', 'api', 'order-worker'], cfg.envFile);
    console.log('Waiting for API health...');
    await waitForHttpOk(`${URL.replace(/\/$/, '')}/health`);
    const dbUrl =
      cfg.dbUrl ||
      `postgres://${process.env.POSTGRES_USER || 'postgres'}:${process.env.POSTGRES_PASSWORD || 'postgres'}@localhost:${
        process.env.POSTGRES_PORT || '5433'
      }/${process.env.POSTGRES_DB || 'flash-sale'}`;
    console.log('Running migrations...');
    await runMigrations(dbUrl);
    console.log('Seeding data...');
    const seeded = await seedData(dbUrl, { users: cfg.users });
    PRODUCT_ID = seeded.productId;
    console.log(`Seeded product ${PRODUCT_ID}. Fetching users...`);
    const users = await fetchUsers(dbUrl, cfg.users);
    console.log(`Building unsigned tokens for ${users.length} users...`);
    tokens = users.map((u) => makeUnsignedJwt({ sub: u.id }));
    userIdsForTokens = users.map((u) => u.id);
  } else {
    // Not full flow: build tokens based on env config
    if (!PRODUCT_ID) {
      console.error('PRODUCT_ID is required when not running with --full');
      process.exit(1);
    }
    if (MODE === 'same-user') {
      const uid = cfg.userId;
      if (!uid) {
        console.error('USER_ID is required for same-user mode');
        process.exit(1);
      }
      tokens = [makeUnsignedJwt({ sub: uid })];
      userIdsForTokens = [uid];
    } else {
      const file = cfg.usersFile;
      if (!file) {
        console.error('USERS_FILE is required for distinct mode when not using --full');
        process.exit(1);
      }
      const p = path.resolve(process.cwd(), file);
      const content = fs.readFileSync(p, 'utf8');
      const ids = content
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);
      if (ids.length === 0) {
        console.error('USERS_FILE is empty');
        process.exit(1);
      }
      tokens = ids.map((id) => makeUnsignedJwt({ sub: id }));
      userIdsForTokens = ids;
    }
  }

  const pickTokenAndUser = buildPickTokenAndUser();

  if (!tokens || tokens.length === 0) {
    console.error('No tokens available for stress test. Aborting.');
    process.exit(1);
  }

  const statusCounts: Record<number, number> = {};
  const errorCounts: Record<string, number> = {}; // key: `${status}|${error}`
  const csvRows: Array<{ status: number; error: string }> = [];
  const attemptsByUser: Record<string, number> = {};
  const testStartedAtIso = new Date().toISOString();

  const instance = autocannon(
  {
    url: buildBaseUrl(),
    connections: CONNECTIONS,
    duration: DURATION,
    amount: cfg.amount ?? cfg.users,
    requests: [
      {
        method: 'POST',
        path: `/orders/${PRODUCT_ID}/order`,
        onResponse: (statusCode: number, body: string) => {
          statusCounts[statusCode] = (statusCounts[statusCode] || 0) + 1;
          if (statusCode >= 300) {
            let errKey = 'unknown_error';
            try {
              const parsed = JSON.parse(body || '{}');
              const e = parsed?.error || parsed?.reason || parsed?.message || 'unknown_error';
              errKey = String(e);
            } catch {
              // ignore parse errors
            }
            const key = `${statusCode}|${errKey}`;
            errorCounts[key] = (errorCounts[key] || 0) + 1;
            csvRows.push({ status: statusCode, error: errKey });
          }
        },
        setupRequest: (req: any) => {
          req.headers = req.headers || {};
          const picked = pickTokenAndUser();
          req.headers['x-auth-token'] = picked.token;
          attemptsByUser[picked.userId] = (attemptsByUser[picked.userId] || 0) + 1;
          return req;
        },
      },
    ],
  },
  (err, res) => {
    if (err) {
      console.error('autocannon error', err);
      process.exit(1);
    }
    const { latency, requests, throughput } = res as any;
    console.log('\n=== Results ===');
    console.log('Latency (ms):', latency);
    console.log('Requests:', requests);
    console.log('Throughput (bytes):', throughput);
    console.log('Status histogram:', Object.fromEntries(Object.entries(statusCounts).sort((a,b)=>Number(a[0])-Number(b[0]))));

    // Emit CSV summary for non-2xx errors
    try {
      const csvOut = ['status,error,count'];
      const grouped = Object.entries(errorCounts)
        .map(([k, count]) => {
          const [statusStr, error] = k.split('|');
          return { status: Number(statusStr), error, count };
        })
        .sort((a, b) => (a.status - b.status) || a.error.localeCompare(b.error));
      for (const row of grouped) {
        // basic CSV escaping for error field
        const escaped = row.error.includes(',') || row.error.includes('"')
          ? '"' + row.error.replace(/"/g, '""') + '"'
          : row.error;
        csvOut.push(`${row.status},${escaped},${row.count}`);
      }
      const file = process.env.ERROR_CSV || 'stress-error-summary.csv';
      fs.writeFileSync(file, csvOut.join('\n'), 'utf8');
      console.log(`Wrote non-2xx error summary to ${file}`);
    } catch (e) {
      console.warn('Failed to write CSV summary:', (e as any)?.message || e);
    }

    // Final DB count of inserted orders for this product since test start
    const dbUrlCount =
      cfg.dbUrl ||
      `postgres://${process.env.POSTGRES_USER || 'postgres'}:${process.env.POSTGRES_PASSWORD || 'postgres'}@localhost:${
        process.env.POSTGRES_PORT || '5433'
      }/${process.env.POSTGRES_DB || 'flash-sale'}`;
    countOrdersForProductSince(dbUrlCount, PRODUCT_ID, testStartedAtIso)
      .then(({ total, perUser }) => {
        console.log(`Inserted ${total} orders for product ${PRODUCT_ID} since ${testStartedAtIso}`);
        const duplicates: Array<{ userId: string; duplicates: number }> = [];
        for (const [uid, attempts] of Object.entries(attemptsByUser)) {
          const inserted = perUser[uid] ? 1 : 0;
          const dups = Math.max(0, attempts - inserted);
          if (dups > 0) duplicates.push({ userId: uid, duplicates: dups });
        }
        if (duplicates.length) {
          console.log('Duplicate Attempts (UserId DuplicateAttemptCount):');
          for (const d of duplicates) console.log(`${d.userId} ${d.duplicates}`);
        } else {
          console.log('No duplicate attempts detected.');
        }
      })
      .catch((e) => {
        console.warn('Could not fetch product order count:', e?.message || e);
      });
  },
  );

  autocannon.track(instance, { renderProgressBar: true });
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
