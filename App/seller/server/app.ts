import express from 'express';

import * as apiKeys from './apiKeys/router.js';
import * as listings from './listings/router.js';
import * as messages from './messages/router.js';
import * as orders from './orders/router.js';
import * as auth from './auth/router.js';
import * as analytics from './analytics/router.js'
import {doCheck} from './auth/middleware.js'

const app = express();
app.use(express.json());

// Mount the API routes on a sub-router so we can expose them at both
// `/seller/api/...` (local dev: Vite proxy and shopper Next.js rewrite keep
// the prefix) and `/api/...` (production: the nginx reverse proxy strips the
// `/seller` prefix before forwarding to this server).
const apiRouter = express.Router();
apiRouter.get('/listings', doCheck, listings.get);
apiRouter.get('/listings/:id/reviews', doCheck, listings.getReviews);
apiRouter.get('/listings/:id/discounts', doCheck, listings.getDiscounts);
apiRouter.get('/orders', doCheck, orders.get);
apiRouter.get('/keys', doCheck, apiKeys.get);
apiRouter.patch('/orders/:orderId/status', doCheck, orders.patchStatus);
apiRouter.post('/listings', doCheck, listings.post);
apiRouter.post('/listings/:id/discounts', doCheck, listings.postDiscount);
apiRouter.put('/listings/:id', doCheck, listings.put);
apiRouter.delete('/listings/:id', doCheck, listings.remove);
apiRouter.delete('/keys/:id', doCheck, apiKeys.remove);
apiRouter.post('/keys', doCheck, apiKeys.post);
apiRouter.post('/messages', doCheck, messages.post);
apiRouter.get('/sessions', doCheck, auth.getSession);
apiRouter.get('/analytics/average-rating', doCheck, analytics.getAvgRating)
apiRouter.get('/analytics/star-distribution', doCheck, analytics.getStarDistribution)
apiRouter.get('/analytics/sales-stats', doCheck, analytics.getSalesStats)

app.use('/seller/api', apiRouter);
app.use('/api', apiRouter);

export default app;
