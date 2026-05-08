import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  database: 'items',
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
});

export { pool };
