import { fileURLToPath } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
import { spawn } from 'node:child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Applies database migrations using drizzle-kit (database/core/local/drizzle.config.ts).
 * Requires database/core devDependencies to be installed in the workspace.
 */
export const applyMigrations = async (connectionString: string) => {
  // Locate the monorepo root by finding pnpm-workspace.yaml upwards
  const findRepoRoot = (startDir: string): string => {
    let dir = startDir;
    const root = path.parse(startDir).root;
    while (true) {
      if (fs.existsSync(path.join(dir, 'pnpm-workspace.yaml'))) return dir;
      if (dir === root) break;
      dir = path.dirname(dir);
    }
    throw new Error('Could not locate repo root (pnpm-workspace.yaml not found)');
  };

  const repoRoot = findRepoRoot(__dirname);
  const dbCoreDir = path.resolve(repoRoot, 'database/core');
  const drizzleBin = path.resolve(dbCoreDir, 'node_modules/.bin/drizzle-kit');
  const configPath = path.resolve(dbCoreDir, 'local/drizzle.config.ts');

  // Basic sanity logs
  // eslint-disable-next-line no-console
  console.log('[migrations] repoRoot:', repoRoot);
  // eslint-disable-next-line no-console
  console.log('[migrations] dbCoreDir:', dbCoreDir);
  // eslint-disable-next-line no-console
  console.log('[migrations] drizzleBin:', drizzleBin);

  // Ensure drizzle-kit binary exists
  if (!fs.existsSync(drizzleBin)) {
    throw new Error(`drizzle-kit binary not found at ${drizzleBin}. Did you run 'pnpm i' at repo root?`);
  }

  await new Promise<void>((resolve, reject) => {
    const child = spawn(drizzleBin, ['push', '--config', configPath, '--force'], {
      cwd: dbCoreDir,
      env: { ...process.env, DATABASE_CONNECTION_URL: connectionString },
      stdio: 'inherit',
    });
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`drizzle-kit push exited with code ${code}`));
    });
  });
};
