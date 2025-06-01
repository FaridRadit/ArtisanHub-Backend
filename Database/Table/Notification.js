import { Sequelize, DataTypes } from "sequelize";
import db from "../Database.js";
import User from "./user.js"; // Pastikan path model User benar

const Notification = db.define("Notification", {
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
    type: {
        type: DataTypes.STRING(50),
        allowNull: false
    },
    title: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    target_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    is_read: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    sent_at: { // Kolom ini yang dicari
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'notifications',
    timestamps: false, // Penting: pastikan ini false karena Anda define sent_at manual
    underscored: true,
});

User.hasMany(Notification, {
    foreignKey: 'user_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
Notification.belongsTo(User, {
    foreignKey: 'user_id'
});

export default Notification;