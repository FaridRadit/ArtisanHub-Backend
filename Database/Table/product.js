import { Sequelize, DataTypes } from "sequelize";
import db from "../Database.js";
import ArtisanProfile from "./art.js";

const Product = db.define("Product", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
        unique: true
    },
    artisan_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: ArtisanProfile,
            key: 'id'
        }
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    currency: {
        type: DataTypes.STRING(3),
        allowNull: false,
        defaultValue: 'IDR'
    },
    main_image_url: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    category: {
        type: DataTypes.STRING(50),
        allowNull: true
    },
    stock_quantity: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    is_available: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    }
}, {
    tableName: 'products',
    timestamps: true,
    underscored: true,
});

ArtisanProfile.hasMany(Product, {
    foreignKey: 'artisan_id',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
});
Product.belongsTo(ArtisanProfile, {
    foreignKey: 'artisan_id'
});

export default Product;
