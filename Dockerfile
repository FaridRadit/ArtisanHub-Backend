
FROM node:20-slim AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev --production

EXPOSE 8080

CMD ["npm", "start"]