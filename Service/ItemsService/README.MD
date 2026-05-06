# itemsService

Service for Items — GraphQL API built with Express, TypeScript, and PostgreSQL.

## Running with Docker

### Build the image

```bash
docker build -t items-service .
```

### Run the container

```bash
docker run -p 4000:4000 --env-file .env items-service
```

The service will be available at `http://localhost:4000`.

### Stop the container

```bash
docker stop $(docker ps -q --filter ancestor=items-service)
```

---

## Environment Variables

Create a `.env` file in the project root before running. Example:

```env
PORT=4000
DATABASE_URL=postgres://user:password@host:5432/dbname
NODE_ENV=production
```

---

## Local Development (without Docker)

Install dependencies and start the dev server with hot reload:

```bash
npm install
npm run dev
```

---

## Scripts

| Script          | Description                             |
| --------------- | --------------------------------------- |
| `npm run dev`   | Start dev server with nodemon + ts-node |
| `npm run build` | Compile TypeScript to `./build`         |
| `npm start`     | Run compiled production build           |
| `npm test`      | Run tests with coverage                 |
| `npm run lint`  | Lint and auto-fix source files          |
