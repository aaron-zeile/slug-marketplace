import dotenv from 'dotenv';

import * as db from './db';

dotenv.config();

export async function resetServiceDatabase(): Promise<void> {
  await db.resetSchema();
}

export async function shutdownServiceDatabase(): Promise<void> {
  db.shutdown();
}
