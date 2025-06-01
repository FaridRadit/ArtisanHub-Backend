import { Sequelize, DataTypes } from "sequelize";
import db from "../Database.js";
import User from "./user.js"; // Pastikan path model User benar

const DeviceToken = db.define("DeviceToken", {
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
        references: {
            model: User,
            key: 'id'
        }
    },
    device_token: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: 'compositeUniqueDeviceToken'
    },
    platform: {
        type: DataTypes.ENUM('android', 'ios'),
        allowNull: false,
        unique: 'compositeUniqueDeviceToken'
    },
    last_used_at: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'device_tokens',
    timestamps: true, // DeviceToken menggunakan createdAt dan updatedAt
    underscored: true,
    indexes: [
        {
            unique: true,
            fields: ['user_id', 'device_token', 'platform'],
            name: 'user_device_platform_unique'
        }
    ]
});

User.hasMany(DeviceToken, {
    foreignKey: 'user_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
DeviceToken.belongsTo(User, {
    foreignKey: 'user_id'
});

export default DeviceToken;