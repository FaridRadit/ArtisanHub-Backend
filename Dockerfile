# Dockerfile

# --- Tahap Pembangunan (Builder Stage) ---
# Menggunakan Node.js versi 20 yang ramping sebagai base image untuk membangun aplikasi.
FROM node:20-slim AS builder

# Setel direktori kerja di dalam container.
WORKDIR /app

# Salin package.json dan package-lock.json
COPY package*.json ./

# Instal hanya dependensi produksi pada tahap ini
RUN npm install --omit=dev --production

# Salin seluruh kode aplikasi dari direktori lokal ke direktori kerja di dalam container.
COPY . .

# --- Tahap Produksi (Production Stage) ---
# Menggunakan Node.js versi 20 yang ramping lagi untuk runtime.
# Ini membuat image akhir lebih kecil dan lebih aman.
FROM node:20-slim

# Setel direktori kerja di dalam container.
WORKDIR /app

# Salin dependensi produksi yang sudah diinstal dari tahap 'builder'.
COPY --from=builder /app/node_modules ./node_modules
# Salin sisa kode aplikasi dari tahap 'builder'.
COPY --from=builder /app .

# Ekspos port yang digunakan aplikasi Anda.
# Cloud Run akan menggunakan port 8080 secara default.
EXPOSE 8080

# Command untuk menjalankan aplikasi Anda.
# Pastikan Main.js berada di Main/Main.js relatif terhadap WORKDIR /app.
CMD ["node", "Main/Main.js"]