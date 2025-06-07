import { Sequelize } from "sequelize";
import dotenv from 'dotenv';
if (process.env.NODE_ENV !== 'production') {
dotenv.config();
}


const db = new Sequelize(
    process.env.DB_NAME,      
    process.env.DB_USER,      
    process.env.DB_PASSWORD,   
    {
        host: process.env.DB_HOST,      
        port: process.env.DB_PORT,     
        dialect: 'mysql',
        logging: false,

        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
    }
);

export default db;