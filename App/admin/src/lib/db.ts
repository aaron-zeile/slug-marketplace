import postgres from 'postgres';

if (!process.env.ADMIN_DATABASE_URL) {
  throw new Error('ADMIN_DATABASE_URL environment variable is not set');
}

const sql = postgres(process.env.ADMIN_DATABASE_URL);

export default sql;
