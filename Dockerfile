WORKDIR /home/app

COPY package.json /home/app/
COPY package-lock.json /home/app/
COPY .env /home/app/

# Login Service
COPY Service/Login/build/ /home/app/Service/Login/build/
COPY Service/Login/src/ /home/app/Service/Login/src/
COPY Service/Login/app.ts /home/app/Service/Login/
COPY Service/Login/server.ts /home/app/Service/Login/
COPY Service/Login/tsconfig.json /home/app/Service/Login/
COPY Service/Login/tsoa.json /home/app/Service/Login/
COPY Service/Login/package.json /home/app/Service/Login/
COPY Service/Login/package-lock.json /home/app/Service/Login/
COPY Service/Login/generated/ /home/app/Service/Login/generated/

# Items Service
COPY Service/ItemsService/build/ /home/app/Service/ItemsService/build/
COPY Service/ItemsService/src/ /home/app/Service/ItemsService/src/
COPY Service/ItemsService/tsconfig.json /home/app/Service/ItemsService/
COPY Service/ItemsService/package.json /home/app/Service/ItemsService/
COPY Service/ItemsService/package-lock.json /home/app/Service/ItemsService/

# Shopper
COPY App/shopper/.next/ /home/app/App/shopper/.next/
COPY App/shopper/src/ /home/app/App/shopper/src/
COPY App/shopper/public/ /home/app/App/shopper/public/
COPY App/shopper/package.json /home/app/App/shopper/
COPY App/shopper/package-lock.json /home/app/App/shopper/
COPY App/shopper/next.config.ts /home/app/App/shopper/
COPY App/shopper/tsconfig.json /home/app/App/shopper/
COPY App/shopper/next-env.d.ts /home/app/App/shopper/

# Admin
COPY App/admin/src/ /home/app/App/admin/src/
COPY App/admin/package.json /home/app/App/admin/
COPY App/admin/package-lock.json /home/app/App/admin/
COPY App/admin/next.config.ts /home/app/App/admin/
COPY App/admin/tsconfig.json /home/app/App/admin/
COPY App/admin/next-env.d.ts /home/app/App/admin/

# Seller
COPY App/seller/shared/ /home/app/App/seller/shared/
COPY App/seller/dist/ /home/app/App/seller/dist/
COPY App/seller/client/ /home/app/App/seller/client/
COPY App/seller/server/ /home/app/App/seller/server/
COPY App/seller/package.json /home/app/App/seller/
COPY App/seller/package-lock.json /home/app/App/seller/
COPY App/seller/tsconfig.base.json /home/app/App/seller/
COPY App/seller/tsconfig.client.json /home/app/App/seller/
COPY App/seller/tsconfig.server.build.json /home/app/App/seller/
COPY App/seller/tsconfig.server.json /home/app/App/seller/

RUN npm run cis

ARG ADMIN_DATABASE_URL
ENV ADMIN_DATABASE_URL=$ADMIN_DATABASE_URL

RUN cd App/admin && npm run build
