import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  // @ts-expect-error: POSTGRES_PORT should never be undefined
  port: parseInt(process.env.POSTGRES_PORT, 10),
  database: 'items',
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
});

export { pool };
