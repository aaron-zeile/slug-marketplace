import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import { createHandler } from 'graphql-http/lib/use/express';
import expressPlayground from 'graphql-playground-middleware-express';
import 'reflect-metadata';
import { buildSchema } from 'type-graphql';

import { expressAuthChecker } from './auth/checker';
import { resolvers } from './resolvers';
import { getAllItems, deleteItemAsAdmin } from './item/db';
import { getAllReviewsAdmin, deleteReviewAsAdmin } from './review/db';

const app: Express = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

async function bootstrap() {
  const schema = await buildSchema({
    resolvers: resolvers,
    validate: true,
    authChecker: expressAuthChecker,

    emitSchemaFile: {
      path: path.resolve(__dirname, '../build/schema.gql'),
      sortedSchema: true,
    },
  });

  app.options(
    '/graphql',
    cors({
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  );

  app.use(
    '/graphql',
    createHandler({
      schema: schema,
      context: (req) => ({
        headers: req.headers,
      }),
    }),
  );

  app.get('/playground', expressPlayground({ endpoint: '/graphql' }));
}

const ADMIN_INTERNAL_SECRET =
  process.env.ADMIN_INTERNAL_SECRET ?? 'dev-internal-secret';

function requireAdminSecret(req: Request, res: Response, next: NextFunction) {
  if (req.headers['x-admin-secret'] !== ADMIN_INTERNAL_SECRET) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }
  next();
}

app.get('/admin/items', requireAdminSecret, async (_req, res) => {
  try {
    const items = await getAllItems();
    res.json(items);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete<{ id: string }>('/admin/items/:id', requireAdminSecret, async (req, res) => {
  try {
    const deleted = await deleteItemAsAdmin(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: 'Item not found' });
      return;
    }
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/admin/reviews', requireAdminSecret, async (_req, res) => {
  try {
    const reviews = await getAllReviewsAdmin();
    res.json(reviews);
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete<{ id: string }>('/admin/reviews/:id', requireAdminSecret, async (req, res) => {
  try {
    const deleted = await deleteReviewAsAdmin(req.params.id);
    if (!deleted) {
      res.status(404).json({ error: 'Review not found' });
      return;
    }
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export { app, bootstrap };
