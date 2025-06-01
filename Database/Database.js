import { Sequelize } from "sequelize";

// TIDAK ADA dotenv.config() di sini karena tidak akan membaca dari .env

const db = new Sequelize(
    "artisandb",                      // Nama database Anda
    "your_app_user_external",         // Username database Anda
    "your_strong_password_external",  // Password database Anda
    {
        host: "34.46.59.140",           // Host database Anda (IP Compute Engine)
        port: 3306,                     // Port database Anda
        dialect: 'mysql',               // Dialek database
        logging: false,                 // Set true untuk melihat query SQL di konsol

        // Konfigurasi Pool Koneksi
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },

     
    }
);

export default db;