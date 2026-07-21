FROM node:18-bookworm-slim
RUN mkdir /app
WORKDIR /app

COPY package*.json ./

RUN npm install

EXPOSE 3080

CMD ["npm", "run", "start", "--reset-cache"]
