import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

export const runMigrations = async (dbUrl: string) => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const repoRoot = path.resolve(__dirname, '../../..');
  const args = ['tsx', 'database/core/seed/seed-data.ts'];
  await new Promise<void>((resolve, reject) => {
    const child = spawn('pnpm', args, {
      cwd: repoRoot,
      env: { ...process.env, DATABASE_CONNECTION_URL: dbUrl, RESET_ON_START: '0' },
      stdio: 'inherit',
    });
    child.on('error', reject);
    child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`seed/migrate exited ${code}`))));
  });
};
