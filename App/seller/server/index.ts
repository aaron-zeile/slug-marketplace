import path from 'node:path';
import { fileURLToPath } from 'node:url';

import express from 'express'

import app from './app.ts'

const port = Number(process.env.PORT ?? 3010);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistDir = path.resolve(__dirname, '../client');

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(clientDistDir));
  app.get(/.*/, (_request, response) => {
    response.sendFile(path.join(clientDistDir, 'index.html'));
  });
}

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${String(port)}`);
});