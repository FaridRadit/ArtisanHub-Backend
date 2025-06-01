# Use a Node.js base image
FROM node:18-slim 

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker's caching
# Ini penting karena jika dependensi tidak berubah, layer ini tidak akan dibangun ulang.
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of the application code
# Ini akan menyalin semua folder dan file yang Anda tunjukkan di gambar (Controller, Database, Main, dll.)
COPY . .

# Expose the port your application listens on
# Pastikan ini sesuai dengan port yang aplikasi Node.js Anda dengarkan (misalnya app.listen(8080))
EXPOSE 8080

# Define the command to run your application
# Ini mengasumsikan Anda memiliki script 'start' di package.json Anda (misalnya "start": "node server.js" atau "start": "nodemon index.js")
CMD ["node", "Main/Main.js"]