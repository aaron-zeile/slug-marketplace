import dotenv from 'dotenv';
dotenv.config();

import { app, bootstrap } from './app';

const port = process.env.PORT || 4500;

app.listen(port, async () => {
  await bootstrap();
  console.log(
    `Running a GraphQL Playground at http://localhost:${port}/playground`,
  );
});
