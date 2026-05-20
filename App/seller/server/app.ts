import express from 'express';
// import path from 'path';
// import { fileURLToPath } from 'url';

import * as listings from './listings/router.js';
import {doCheck} from './auth/middleware.js'

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

/** API ENDPOINTS HERE **/
// app.get('/api/listings', listings.get);
app.get('/seller/api/listings', doCheck, listings.get);
app.post('/seller/api/listings', doCheck, listings.post);
app.put('/seller/api/listings/:id', doCheck, listings.put);
app.delete('/seller/api/listings/:id', doCheck, listings.remove);


export default app;
