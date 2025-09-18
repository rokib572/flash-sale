/*
  Simple stress runner:
  - Fires many concurrent POST /sale/purchase with distinct userIds
  - Reports successes and failures
*/
import { setTimeout as sleep } from 'node:timers/promises';

const API = process.env.API_URL || 'http://localhost:4000';
const USERS = Number(process.env.USERS || 5000);
const CONCURRENCY = Number(process.env.CONCURRENCY || 200);

const run = async () => {
  let inFlight = 0;
  let i = 0;
  let ok = 0;
  let fail = 0;

  const worker = async () => {
    while (true) {
      const id = i++;
      if (id >= USERS) return;
      const userId = `user-${id}`;
      try {
        const res = await fetch(`${API}/sale/purchase`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        });
        const data = await res.json();
        if (data.ok) ok++; else fail++;
      } catch {
        fail++;
      }
    }
  };

  const start = Date.now();
  const workers = Array.from({ length: CONCURRENCY }, () => worker());
  await Promise.all(workers);
  const ms = Date.now() - start;
  console.log(JSON.stringify({ ok, fail, ms, rps: Math.round((ok + fail) / (ms / 1000)) }));
};

run();
