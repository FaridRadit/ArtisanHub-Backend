import { Sequelize, DataTypes } from "sequelize";
import db from "../Database.js";
import User from "./user.js";

const ArtisanProfile = db.define("ArtisanProfile", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        unique: true
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
            model: User,
            key: 'id'
        }
    },
    bio: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    expertise_category: {
        type: DataTypes.STRING(100),
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
        
        type: DataTypes.GEOMETRY('POINT'), // MySQL tidak secara spesifik menggunakan SRID 4326 di definisi tipe
        allowNull: true
    },
    operational_hours: {
        type: DataTypes.JSON, // PERBAIKAN: Ganti JSONB menjadi JSON
        allowNull: true
    },
    contact_email: {
        type: DataTypes.STRING(100),
        allowNull: true,
        validate: {
            isEmail: true
        }
    },
    contact_phone: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    website_url: {
        type: DataTypes.STRING(255),
        allowNull: true,
        validate: {
            isUrl: true
        }
    },
    social_media_links: {
        type: DataTypes.JSON, // PERBAIKAN: Ganti JSONB menjadi JSON
        allowNull: true
    },
    avg_rating: {
        type: DataTypes.DECIMAL(2, 1),
        allowNull: false,
        defaultValue: 0.0
    },
    total_reviews: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    is_verified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    tableName: 'artisan_profiles',
    timestamps: true,
    underscored: true,
});

User.hasOne(ArtisanProfile, {
    foreignKey: 'user_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
ArtisanProfile.belongsTo(User, {
    foreignKey: 'user_id'
});

export default ArtisanProfile;