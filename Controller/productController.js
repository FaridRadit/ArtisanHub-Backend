import Product from "../Database/Table/product.js";
import ArtisanProfile from "../Database/Table/art.js";
import { Op } from "sequelize";

async function getAllProducts(req, res) {
    try {
        const { category, q, artisanId, limit = 10, offset = 0 } = req.query;
        let whereClause = {};
        let includeClause = [{
            model: ArtisanProfile,
            attributes: ['id', 'user_id', 'expertise_category', 'address']
        }];
        let orderClause = [['created_at', 'DESC']];

        if (category) {
            whereClause.category = category;
        }

        if (q) {
            whereClause[Op.or] = [
                { name: { [Op.iLike]: `%${q}%` } },
                { description: { [Op.iLike]: `%${q}%` } }
            ];
        }

        if (artisanId) {
            whereClause.artisan_id = artisanId;
        }

        const products = await Product.findAll({
            where: whereClause,
            include: includeClause,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: orderClause
        });

        if (products.length === 0) {
            return res.status(404).json({ message: "No products found matching your criteria." });
        }

        res.status(200).json({
            message: "Products retrieved successfully",
            data: products
        });

    } catch (error) {
        console.error('Error getting all products:', error.message);
        res.status(500).json({ message: "Server error getting products", error: error.message });
    }
}

async function getProductById(req, res) {
    try {
        const { id } = req.params;

        const product = await Product.findByPk(id, {
            include: [{
                model: ArtisanProfile,
                attributes: ['id', 'user_id', 'expertise_category', 'address', 'contact_email', 'contact_phone']
            }]
        });

        if (!product) {
            return res.status(404).json({ message: "Product not found." });
        }

        res.status(200).json({
            message: "Product retrieved successfully",
            data: product
        });

    } catch (error) {
        console.error('Error getting product by ID:', error.message);
        res.status(500).json({ message: "Server error getting product", error: error.message });
    }
}

async function createProduct(req, res) {
    try {
        const { artisan_id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        const { name, description, price, currency, main_image_url, category, stock_quantity, is_available } = req.body;
        if (!name || !price || !currency) {
            return res.status(400).json({ message: "Name, price, and currency are required." });
        }

        const targetArtisanProfile = await ArtisanProfile.findByPk(artisan_id);
        if (!targetArtisanProfile) {
            return res.status(404).json({ message: "Target artisan profile not found." });
        }

        if (userRole === 'artisan' && targetArtisanProfile.user_id !== userId) {
            return res.status(403).json({ message: "Forbidden: You can only add products to your own artisan profile." });
        } else if (userRole !== 'artisan' && userRole !== 'admin') {
            return res.status(403).json({ message: "Forbidden: Only artisans or admins can add products." });
        }

        const newProduct = await Product.create({
            artisan_id: artisan_id,
            name,
            description,
            price,
            currency,
            main_image_url,
            category,
            stock_quantity,
            is_available
        });

        res.status(201).json({
            message: "Product created successfully",
            data: newProduct
        });

    } catch (error) {
        console.error('Error creating product:', error.message);
        res.status(500).json({ message: "Server error creating product", error: error.message });
    }
}

async function updateProduct(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        const product = await Product.findByPk(id);

        if (!product) {
            return res.status(404).json({ message: "Product not found." });
        }

        const owningArtisanProfile = await ArtisanProfile.findByPk(product.artisan_id);
        if (!owningArtisanProfile) {
            return res.status(404).json({ message: "Owning artisan profile not found for this product." });
        }

        if (userRole === 'artisan' && owningArtisanProfile.user_id !== userId) {
            return res.status(403).json({ message: "Forbidden: You can only update your own products." });
        } else if (userRole !== 'artisan' && userRole !== 'admin') {
            return res.status(403).json({ message: "Forbidden: Only artisans or admins can update products." });
        }

        const updateData = req.body;

        await product.update(updateData);

        res.status(200).json({
            message: "Product updated successfully",
            data: product
        });

    } catch (error) {
        console.error('Error updating product:', error.message);
        res.status(500).json({ message: "Server error updating product", error: error.message });
    }
}

async function deleteProduct(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        const product = await Product.findByPk(id);

        if (!product) {
            return res.status(404).json({ message: "Product not found." });
        }

        const owningArtisanProfile = await ArtisanProfile.findByPk(product.artisan_id);
        if (!owningArtisanProfile) {
            return res.status(404).json({ message: "Owning artisan profile not found for this product." });
        }

        if (userRole === 'artisan' && owningArtisanProfile.user_id !== userId) {
            return res.status(403).json({ message: "Forbidden: You can only delete your own products." });
        } else if (userRole !== 'artisan' && userRole !== 'admin') {
            return res.status(403).json({ message: "Forbidden: Only artisans or admins can delete products." });
        }

        await product.destroy();

        res.status(200).json({ message: "Product deleted successfully." });

    } catch (error) {
        console.error('Error deleting product:', error.message);
        res.status(500).json({ message: "Server error deleting product", error: error.message });
    }
}

export {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};