import Product from "../Database/Table/product.js";
import ArtisanProfile from "../Database/Table/art.js";
import { Op } from "sequelize";

async function createProduct(req, res) {
    try {
        const { artisan_id } = req.params; 
        
        if (!req.user || !req.user.id || !req.user.role) {
            console.error('Error creating product: req.user is undefined or missing properties. Check authMiddleware.');
            return res.status(401).json({ message: "Authentication failed: User information not available." });
        }
        const userId = req.user.id;
        const userRole = req.user.role;
        console.log(`User ID: ${userId}, Role: ${userRole} attempting to create product for artisan_id: ${artisan_id}`);
        console.log(`Note: artisan_id from params is likely the user_id from Flutter.`);

        const { name, description, price, currency, main_image_url, category, stock_quantity, is_available } = req.body;
        console.log('Request body for product:', req.body);

        if (!name || !price || !currency) {
            return res.status(400).json({ message: "Name, price, and currency are required." });
        }

        const targetArtisanProfile = await ArtisanProfile.findOne({ where: { user_id: artisan_id } }); 
        
        console.log('Target Artisan Profile found by user_id:', targetArtisanProfile ? targetArtisanProfile.toJSON() : 'null');

        if (!targetArtisanProfile) {
            return res.status(404).json({ message: "Target artisan profile not found for the provided user ID." });
        }

        if (userRole === 'artisan' && targetArtisanProfile.user_id !== userId) {
            console.warn(`Forbidden: Artisan ${userId} tried to add product to profile ${targetArtisanProfile.id} (owner user_id: ${targetArtisanProfile.user_id})`);
            return res.status(403).json({ message: "Forbidden: You can only add products to your own artisan profile." });
        } else if (userRole !== 'artisan' && userRole !== 'admin') {
            return res.status(403).json({ message: "Forbidden: Only artisans or admins can add products." });
        }
        console.log('Authorization successful for product creation.');

        const newProduct = await Product.create({
            artisan_id: targetArtisanProfile.id, 
            name,
            description,
            price,
            currency,
            main_image_url,
            category,
            stock_quantity,
            is_available
        });
        console.log('Product created in DB:', newProduct.toJSON());

        res.status(201).json({
            message: "Product created successfully",
            data: newProduct
        });

    } catch (error) {
        console.error('Error creating product:', error.message);
        if (error.stack) {
            console.error('Error stack:', error.stack);
        }
        res.status(500).json({ message: "Server error creating product", error: error.message });
    }
}

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

        // --- PERBAIKAN PENTING DI SINI ---
        if (artisanId) {
            // Asumsi: artisanId yang datang dari query parameter adalah ArtisanProfile.id (primary key)
            // yang diteruskan dari Flutter (selectedArtisan.id!).
            // Jadi, langsung gunakan ID ini untuk memfilter produk.
            whereClause.artisan_id = parseInt(artisanId); 
            console.log(`Filtering products by ArtisanProfile ID: ${whereClause.artisan_id}`);
        }
        // --- AKHIR PERBAIKAN ---

        const products = await Product.findAll({
            where: whereClause,
            include: includeClause,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: orderClause
        });

        if (products.length === 0) {
            return res.status(200).json({ message: "No products found matching your criteria.", data: [] });
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

async function updateProduct(req, res) {
    try {
        const { id } = req.params;
        
        if (!req.user || !req.user.id || !req.user.role) {
            console.error('Error updating product: req.user is undefined or missing properties. Check authMiddleware.');
            return res.status(401).json({ message: "Authentication failed: User information not available." });
        }
        const userId = req.user.id;
        const userRole = req.user.role;
        console.log(`User ID: ${userId}, Role: ${userRole} attempting to update product ID: ${id}`);


        const product = await Product.findByPk(id);

        if (!product) {
            return res.status(404).json({ message: "Product not found." });
        }

        const owningArtisanProfile = await ArtisanProfile.findByPk(product.artisan_id);
        
        if (!owningArtisanProfile) {
            console.error('Owning artisan profile not found for product_id:', id, 'artisan_id:', product.artisan_id);
            return res.status(404).json({ message: "Owning artisan profile not found for this product." });
        }

        if (userRole === 'artisan' && owningArtisanProfile.user_id !== userId) {
            console.warn(`Forbidden: Artisan ${userId} tried to update product ${id} belonging to artisan user_id: ${owningArtisanProfile.user_id}`);
            return res.status(403).json({ message: "Forbidden: You can only update your own products." });
        } else if (userRole !== 'artisan' && userRole !== 'admin') {
            return res.status(403).json({ message: "Forbidden: Only artisans or admins can update products." });
        }
        console.log('Authorization successful for product update.');


        const updateData = req.body;
        console.log('Update data for product:', updateData);

        await product.update(updateData);

        res.status(200).json({
            message: "Product updated successfully",
            data: product
        });

    } catch (error) {
        console.error('Error updating product:', error.message);
        if (error.stack) {
            console.error('Error stack:', error.stack);
        }
        res.status(500).json({ message: "Server error updating product", error: error.message });
    }
}

async function deleteProduct(req, res) {
    try {
        const { id } = req.params;

        if (!req.user || !req.user.id || !req.user.role) {
            console.error('Error deleting product: req.user is undefined or missing properties. Check authMiddleware.');
            return res.status(401).json({ message: "Authentication failed: User information not available." });
        }
        const userId = req.user.id;
        const userRole = req.user.role;
        console.log(`User ID: ${userId}, Role: ${userRole} attempting to delete product ID: ${id}`);


        const product = await Product.findByPk(id);

        if (!product) {
            return res.status(404).json({ message: "Product not found." });
        }

        const owningArtisanProfile = await ArtisanProfile.findByPk(product.artisan_id);
        
        if (!owningArtisanProfile) {
            console.error('Owning artisan profile not found for product_id:', id, 'artisan_id:', product.artisan_id);
            return res.status(404).json({ message: "Owning artisan profile not found for this product." });
        }

        if (userRole === 'artisan' && owningArtisanProfile.user_id !== userId) {
            console.warn(`Forbidden: Artisan ${userId} tried to delete product ${id} belonging to artisan user_id: ${owningArtisanProfile.user_id}`);
            return res.status(403).json({ message: "Forbidden: You can only delete your own products." });
        } else if (userRole !== 'artisan' && userRole !== 'admin') {
            return res.status(403).json({ message: "Forbidden: Only artisans or admins can delete products." });
        }
        console.log('Authorization successful for product deletion.');


        await product.destroy();

        res.status(200).json({ message: "Product deleted successfully." });

    } catch (error) {
        console.error('Error deleting product:', error.message);
        if (error.stack) {
            console.error('Error stack:', error.stack);
        }
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
