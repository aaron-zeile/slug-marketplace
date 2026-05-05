import dotenv from 'dotenv';
dotenv.config();

import { app, bootstrap } from './app';

app.listen(4000, async () => {
  await bootstrap();
  console.log(
    'Running a GraphQL Playground at http://localhost:4000/playground',
  );
});
