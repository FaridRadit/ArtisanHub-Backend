import { Sequelize, DataTypes } from "sequelize";
import db from "../Database.js"; 

const User = db.define("User", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        unique: true
    },
    username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true
        }
    },
    password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    role: {
        type: DataTypes.ENUM('user', 'artisan', 'admin'),
        allowNull: false,
        defaultValue: 'user'
    },
    full_name: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    phone_number: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    profile_picture_url: {
        type: DataTypes.STRING(255),
        allowNull: true
    }
}, {
    tableName: 'users',
    timestamps: true,
    underscored: true,
});

export default User;