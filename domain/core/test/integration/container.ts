import { GenericContainer, Wait, StartedTestContainer } from 'testcontainers';

let container: StartedTestContainer | undefined;
let dbUrl: string | undefined;

export const startTestDb = async (): Promise<string> => {
  if (dbUrl) return dbUrl;

  // Fallback: use externally provided DB URL (e.g., compose or local Postgres)
  const externalUrl = process.env.TEST_DB_URL;
  if (externalUrl) {
    // eslint-disable-next-line no-console
    console.log('[testcontainers] Using external TEST_DB_URL');
    dbUrl = externalUrl;
    return dbUrl;
  }
  container = await new GenericContainer('postgres:16-alpine')
    .withExposedPorts(5432)
    .withEnvironment({
      POSTGRES_USER: 'test',
      POSTGRES_PASSWORD: 'test',
      POSTGRES_DB: 'testdb',
    })
    .withWaitStrategy(Wait.forLogMessage('database system is ready to accept connections'))
    .withStartupTimeout(180_000)
    .start();

  const port = container.getMappedPort(5432);
  dbUrl = `postgres://test:test@127.0.0.1:${port}/testdb`;
  return dbUrl;
};

export const stopTestDb = async () => {
  if (container) {
    try {
      await container.stop({ timeout: 30_000 });
    } finally {
      container = undefined;
      dbUrl = undefined;
    }
  }
};
