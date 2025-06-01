FROM node:20

WORKDIR /app
COPY . .
RUN npm install
expose 8080
CMD ["npm", "start"]