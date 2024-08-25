import { PostgreSqlContainer } from '@testcontainers/postgresql';

export async function startPostgresContainer() {
  const container = await new PostgreSqlContainer()
    .withDatabase('testdb')
    .withUsername('testuser')
    .withPassword('testpass')
    .start();

  return container;
}
