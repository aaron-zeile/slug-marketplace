import cors from 'cors';
import express, { Express, NextFunction, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import swaggerUi from 'swagger-ui-express';

import { RegisterRoutes } from './src/generated/routes';

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

const router = express.Router();
RegisterRoutes(router);
app.use('/api/v0', router);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  // console.error('[login-service] Request failed', error)

  res.status(500).json({
    message: error instanceof Error ? error.message : 'Login service error',
  });
});

app.use('/docs', swaggerUi.serve, async (_req: Request, res: Response) => {
  const swaggerDocument = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'swagger.json'), 'utf8'),
  ) as object;
  res.send(swaggerUi.generateHTML(swaggerDocument));
});

export { app };
