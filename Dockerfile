FROM node:25-alpine
EXPOSE 3000

WORKDIR /home/app

COPY package.json /home/app/
COPY package-lock.json /home/app/
COPY .env /home/app/

# Microservices
COPY Services/Login/build /home/app/Services/Login/build 
COPY Services/Login/package.json /home/app/Services/Login/  
COPY Services/Login/package-lock.json /home/app/Services/Login/

COPY Services/ItemService/build /home/app/Services/ItemService/build
COPY Services/ItemService/package.json /home/app/Services/ItemService/  
COPY Services/ItemService/package-lock.json /home/app/Services/ItemService/

# Web apps
COPY App/shopper/.next/ /home/app/App/shopper/.next/
COPY App/shopper/package.json /home/app/App/shopper/
COPY App/shopper/package-lock.json /home/app/App/shopper/
COPY app/next.config.ts /home/app/App/shopper/next.config.ts
COPY App/shopper/public/ /home/app/App/shopper/public/

RUN npm run cis

CMD ["npm", "start"]