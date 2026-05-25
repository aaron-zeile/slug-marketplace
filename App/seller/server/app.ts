import express from 'express';
// import path from 'path';
// import { fileURLToPath } from 'url';

import * as apiKeys from './apiKeys/router.js';
import * as listings from './listings/router.js';
import * as messages from './messages/router.js';
import * as orders from './orders/router.js';
import * as auth from './auth/router.js';
import {doCheck} from './auth/middleware.js'

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

/** API ENDPOINTS HERE **/
// app.get('/api/listings', listings.get);
app.get('/seller/api/listings', doCheck, listings.get);
app.get('/seller/api/orders', doCheck, orders.get);
app.post('/seller/api/listings', doCheck, listings.post);
app.put('/seller/api/listings/:id', doCheck, listings.put);
app.delete('/seller/api/listings/:id', doCheck, listings.remove);
app.post('/seller/api/keys', doCheck, apiKeys.post);
app.post('/seller/api/messages', doCheck, messages.post);
app.get('/seller/api/sessions', doCheck, auth.getSession);


export default app;
