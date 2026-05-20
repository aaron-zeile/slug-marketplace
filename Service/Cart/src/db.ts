import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  // @ts-expect-error: POSTGRES_PORT in env
  port: parseInt(process.env.POSTGRES_PORT),
  database: process.env.CART_POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
});

export { pool };
