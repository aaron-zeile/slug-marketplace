# --- Build stage ---
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# --- Runtime stage ---
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/build ./build

RUN chown -R node:node /app

EXPOSE 4010

USER node

CMD ["node", "build/server.js"]
