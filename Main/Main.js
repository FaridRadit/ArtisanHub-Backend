import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from '../Database/Database.js';
import swaggerJsdoc from 'swagger-jsdoc'; 
import swaggerUi from 'swagger-ui-express'; 
import swaggerOptions from '../config/swaggerOptions.js'; 
import User from '../Database/Table/user.js';
import ArtisanProfile from '../Database/Table/art.js';
import Product from '../Database/Table/product.js';
import Event from '../Database/Table/events.js';
import DeviceToken from '../Database/Table/DeviceToken.js';
import Notification from '../Database/Table/Notification.js';
import authRoutes from "../Routes/authRoutes.js";
import artisanRoutes from "../Routes/artisanRoutes.js";
import productRoutes from "../Routes/productRoutes.js";
import eventRoutes from "../Routes/eventRoutes.js";
import notificationRoutes from "../Routes/notificationRoutes.js";

dotenv.config({path:'../.env'});

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/artisans", artisanRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/notifications", notificationRoutes);
/**
 * @swagger
 * tags:
 * name: General
 * description: Endpoint umum untuk status API.
 */

/**
 * @swagger
 * /:
 * get:
 * summary: Mendapatkan pesan selamat datang dari API
 * tags: [General]
 * description: Endpoint ini mengembalikan pesan sederhana untuk mengkonfirmasi bahwa API backend berjalan dan dapat diakses.
 * responses:
 * 200:
 * description: Pesan selamat datang berhasil diterima.
 * content:
 * text/plain:
 * schema:
 * type: string
 * example: Welcome to Artisan Hub Backend API!
 */
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
const PORT = process.env.PORT || 8080; 


async function syncDatabaseAndStartServer() {
    try {
        await db.authenticate();
        console.log('Connection to MySQL database has been established successfully.');

        await User.sync({ force: true });
        await ArtisanProfile.sync({ alter: true });
        await Product.sync({ alter: true });
        await Event.sync({ alter: true });
        await DeviceToken.sync({ alter: true });
        await Notification.sync({ alter: true });
        
        console.log('All models were synchronized with MySQL successfully.');

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:8080`);
            console.log('Press CTRL+C to stop the server');
        });
    } catch (error) {
        console.error('Unable to connect to the database or sync models:', error);
        process.exit(1);
    }
}

syncDatabaseAndStartServer();