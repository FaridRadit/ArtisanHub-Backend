import { Sequelize, DataTypes } from "sequelize";
import db from "../Database.js";

const Event = db.define("Event", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        unique: true
    },
    name: {
        type: DataTypes.STRING(150),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    start_date: {
        type: DataTypes.DATEONLY, // Hanya tanggal, tanpa waktu
        allowNull: false
    },
    end_date: {
        type: DataTypes.DATEONLY, // Hanya tanggal, tanpa waktu
        allowNull: false
    },
    location_name: {
        type: DataTypes.STRING(200),
        allowNull: false
    },
    address: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    latitude: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: false
    },
    longitude: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: false
    },
    location_point: {
        type: DataTypes.GEOMETRY('POINT', 4326), // Tipe GEOMETRY POINT dengan SRID 4326 (WGS84)
        allowNull: true
    },
    organizer: {
        type: DataTypes.STRING(100),
        allowNull: true 
    },
    event_url: {
        type: DataTypes.STRING(255),
        allowNull: true,
        validate: {
            isUrl: true
        }
    },
    poster_image_url: {
        type: DataTypes.STRING(255),
        allowNull: true,
        validate: {
            isUrl: true
        }
    }
}, {
    tableName: 'events',
    timestamps: true,
    underscored: true,
});

export default Event;