import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';

export function createDatabase(databaseUrl: string) {
  if (!databaseUrl) throw new Error('DATABASE_URL is required');
  const client = postgres(databaseUrl, { max: 10 });
  return drizzle(client);
}
