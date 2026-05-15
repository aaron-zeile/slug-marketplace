import express, { Express } from 'express';
import cors from 'cors';
import path from 'path';
import { createHandler } from 'graphql-http/lib/use/express';
import expressPlayground from 'graphql-playground-middleware-express';
import 'reflect-metadata';
import { buildSchema } from 'type-graphql';

import { expressAuthChecker } from './auth/checker';
import { resolvers } from './resolvers';

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

export { app, bootstrap };
