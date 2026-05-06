FROM node:18

WORKDIR /app

COPY package*.json ./

RUN npm install
RUN npm install -g nodemon

COPY . .

EXPOSE 4000

CMD ["nodemon", "--watch", "src", "--ext", "ts", "--exec", "npx ts-node src/server.ts"]