import { getDbClient, hashPasswordScrypt, users } from '@flash-sale/domain-core';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const seedData = async () => {
  const connectionString = process.env.DATABASE_CONNECTION_URL;
  if (!connectionString)
    throw new Error('DATABASE_CONNECTION_URL environment variable is required');

  const { db, queryClient } = getDbClient(connectionString, {
    logQueries: process.env.DATABASE_LOG_QUERIES === 'true',
  });

  const userEmailDomain = process.env.SEED_USER_DOMAIN || 'seed.local';
  const passwordConvention = (i: number) => `User${i}!Pass`; // predefined password pattern

  try {
    const reset = String(process.env.RESET_ON_START || '').toLowerCase();
    if (reset === '1' || reset === 'true' || reset === 'yes') {
      console.warn('[SEED] RESET_ON_START enabled — dropping schemas core_data and migration_data');
      try {
        await queryClient.unsafe('DROP SCHEMA IF EXISTS core_data CASCADE;');
      } catch {}
      try {
        await queryClient.unsafe('DROP SCHEMA IF EXISTS migration_data CASCADE;');
      } catch {}
    }

    const runMigrations = async () =>
      await new Promise<void>((resolve, reject) => {
        const __dirname = path.dirname(fileURLToPath(import.meta.url));
        const dbCoreDir = path.resolve(__dirname, '..');
        const drizzleBin = path.resolve(dbCoreDir, 'node_modules/.bin/drizzle-kit');
        const configPath = path.resolve(dbCoreDir, 'local/drizzle.config.ts');
        const child = spawn(drizzleBin, ['push', '--config', configPath, '--force'], {
          cwd: dbCoreDir,
          env: process.env,
          stdio: 'inherit',
        });
        child.on('error', reject);
        child.on('exit', (code) => {
          if (code === 0) resolve();
          else reject(new Error(`drizzle-kit push exited with code ${code}`));
        });
      });

    await runMigrations();
    console.log('Migrations applied.');

    // Users: seed only if empty
    const userCheck = await db.select().from(users).limit(1);
    if (userCheck.length > 0) {
      console.log('Users table already has data. Skipping user seeding.');
    } else {
      console.log('Starting user seeding for 1 user...');

      const email = process.env.SEED_USER_EMAIL || `user1@${userEmailDomain}`;
      const givenName = process.env.SEED_USER_GIVEN_NAME || 'Test';
      const familyName = process.env.SEED_USER_FAMILY_NAME || 'User';
      const plainPassword = process.env.SEED_USER_PASSWORD || passwordConvention(1);
      const passwordHash = await hashPasswordScrypt(plainPassword);

      await db.insert(users).values([
        {
          email,
          givenName,
          familyName,
          passwordHash,
          disabled: false,
          deleted: false,
        },
      ]);

      console.log('User seeding completed successfully!');
    }
  } finally {
    await queryClient.end();
  }
};

try {
  await seedData();
} catch (err) {
  console.error('❌ Error running database seed:', err);
  process.exit(1);
}
