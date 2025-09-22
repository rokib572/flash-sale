import { spawn } from 'child_process';
import http from 'http';

const sh = (cmd: string, args: string[], opts: { cwd?: string; env?: NodeJS.ProcessEnv } = {}) =>
  new Promise<void>((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: 'inherit', cwd: opts.cwd, env: opts.env });
    child.on('error', reject);
    child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}`))));
  });

export const dockerUp = async (services: string[] = ['postgres', 'redis', 'api'], envFile = '.env.local') => {
  // Ensure the API container does not run its own seed/migrations when doing a full stress run
  // to avoid contention with the orchestrated migrations in this script.
  const env = { ...process.env, SEED_ON_START: 'false' };
  await sh('docker', ['compose', '--env-file', envFile, 'up', '-d', ...services], { env });
};

export const waitForHttpOk = async (url: string, timeoutMs = 60_000) => {
  const start = Date.now();
  let lastErr: any;
  while (Date.now() - start < timeoutMs) {
    try {
      await new Promise<void>((resolve, reject) => {
        const req = http.get(url, (res) => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) resolve();
          else reject(new Error(`status ${res.statusCode}`));
        });
        req.on('error', reject);
        req.setTimeout(3000, () => req.destroy(new Error('timeout')));
      });
      return;
    } catch (e) {
      lastErr = e;
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  throw new Error(`waitForHttpOk timeout: ${lastErr}`);
};
