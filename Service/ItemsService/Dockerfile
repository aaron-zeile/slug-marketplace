# --- Build stage ---
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build  

# --- Runtime stage ---
FROM node:18-alpine AS runner

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --from=builder /app/build ./build

EXPOSE 4000

USER node

CMD ["node", "build/server.js"]
