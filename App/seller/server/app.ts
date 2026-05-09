import express from 'express';
// import path from 'path';
// import { fileURLToPath } from 'url';

import * as listings from './listings/router.js';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

/** API ENDPOINTS HERE **/
// app.get('/api/listings', listings.get);
app.get('/seller/api/listings', listings.get);


export default app;
