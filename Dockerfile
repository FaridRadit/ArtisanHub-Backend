
FROM node:20-slim AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install --omit=dev --production

COPY . .

FROM node:20-slim

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app .

EXPOSE 8080

CMD ["node", "Main/Main.js"]