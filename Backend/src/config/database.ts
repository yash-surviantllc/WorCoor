import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';

import { loadEnv } from './env.js';

let pool: Pool | null = null;

export function getPool(): Pool {
  if (!pool) {
    const env = loadEnv();
    pool = new Pool({
      connectionString: env.DATABASE_URL,
      max: 10,
    });
  }
  return pool;
}

export const db = drizzle(getPool());
