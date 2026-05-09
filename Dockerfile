FROM node:25-alpine
EXPOSE 3000 3002 3010

WORKDIR /home/app

COPY package.json package-lock.json .env ./
RUN npm ci --omit=dev

# Login Service (build only)
COPY Service/Login/build/ ./Service/Login/build/
COPY Service/Login/package.json Service/Login/package-lock.json ./Service/Login/
RUN cd Service/Login && npm ci --omit=dev

# Items Service (build only)
COPY Service/ItemsService/build/ ./Service/ItemsService/build/
COPY Service/ItemsService/package.json Service/ItemsService/package-lock.json ./Service/ItemsService/
RUN cd Service/ItemsService && npm ci --omit=dev

# Shopper (build only)
COPY App/shopper/.next/ ./App/shopper/.next/
COPY App/shopper/public/ ./App/shopper/public/
COPY App/shopper/package.json App/shopper/package-lock.json App/shopper/next.config.ts ./App/shopper/
RUN cd App/shopper && npm ci --omit=dev

# Admin (build only)
COPY App/admin/.next/ ./App/admin/.next/
COPY App/admin/package.json App/admin/package-lock.json App/admin/next.config.ts ./App/admin/
RUN cd App/admin && npm ci --omit=dev

# Seller (build only)
COPY App/seller/dist/ ./App/seller/dist/
COPY App/seller/client/dist/ ./App/seller/client/dist/
COPY App/seller/package.json App/seller/package-lock.json ./App/seller/
RUN cd App/seller && npm ci --omit=dev

CMD ["npm", "start"]