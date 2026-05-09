import express from 'express';
// import path from 'path';
// import { fileURLToPath } from 'url';

import * as listings from './listings/router.js';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

/** API ENDPOINTS HERE **/
app.get('/api/listings', listings.get);

// Static frontend serving belongs in server/index.ts so npm run dev can use Vite
// without requiring client/dist to exist first.

// Serve static frontend files
// app.use(express.static(path.join(__dirname, '../client/dist')));

// Catch-all route for React router
// app.get('/{*path}', (_req, res) => {
//   res.sendFile(path.join(__dirname, '../client/dist/index.html'));
// });

export default app;
