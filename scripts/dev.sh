#!/usr/bin/env bash
set -e

cd "$(dirname "$0")/.."

docker rm -f app postgres marketplace_shopper_service marketplace_items_service marketplace_login_service marketplace_items_db items-service-db cart-service-db order-service-db 2>/dev/null || true

for port in 3000 3002 3010 4000 4010 4500 4600 4700 5173; do
  lsof -ti tcp:$port | xargs kill -9 2>/dev/null || true
done

docker compose -f Service/Login/docker-compose.yml up -d login-db
docker compose --env-file Service/ItemsService/.env -f Service/ItemsService/docker-compose.yml up -d postgres
docker compose --env-file Service/Cart/.env -f Service/Cart/docker-compose.yml up -d postgres
docker compose -f Service/Order/docker-compose.yml up -d postgres

if [ ! -x Service/Order/node_modules/.bin/ts-node ] || [ ! -x Service/Order/node_modules/.bin/nodemon ]; then
  echo "Installing Order service dependencies..."
  npm install --prefix Service/Order
fi

npm run dev:local
