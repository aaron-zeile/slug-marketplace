import { Pool } from 'pg';
import * as fs from 'fs';

import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  host: process.env.POSTGRES_HOST ?? 'localhost',
  port: parseInt(process.env.POSTGRES_PORT ?? '5431', 10),
  database: process.env.POSTGRES_DB ?? 'items',
  user: process.env.POSTGRES_USER ?? 'postgres',
  password: process.env.POSTGRES_PASSWORD ?? 'postgres',
});

const run = async (file: string) => {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split(/\r?\n/);
  let statement = '';
  for (let line of lines) {
    line = line.trim();
    if (!line.startsWith('--') && !line.startsWith('\\')) {
      statement += ' ' + line + '\n';
      if (line.endsWith(';')) {
        await pool.query(statement);
        statement = '';
      }
    }
  }
};

const resetSchema = async () => {
  await run('src/sql/schema.sql');
};

const reset = async () => {
  await resetSchema();
  await run('src/sql/data.sql');
};

const shutdown = () => {
  pool.end();
};

export { reset, resetSchema, shutdown };
