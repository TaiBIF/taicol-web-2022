From node:alpine
RUN mkdir /app
WORKDIR /app

COPY package*.json ./

RUN npm install

EXPOSE 3080

CMD ["npm", "run", "start"]
