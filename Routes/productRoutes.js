import express from 'express';
import {
    getAllProducts,
    getProductById,
   createProduct,
    updateProduct,
    deleteProduct
} from '../Controller/productController.js';
import { authenticateToken, authorizeRole } from '../Middleware/authMiddleware.js';

const router = express.Router();

// GET /api/products - Mendapatkan daftar produk (publik, tidak perlu autentikasi)
router.get('/', getAllProducts);

// GET /api/products/:id - Mendapatkan detail produk (publik, tidak perlu autentikasi)
router.get('/:id', getProductById);

// POST /api/artisans/:artisan_id/products - Menambah produk baru untuk pengrajin tertentu
router.post('/:artisan_id',createProduct);
// PUT /api/products/:id - Memperbarui produk
// Hanya pemilik produk (pengrajin) atau admin yang bisa mengupdate
router.put('/:id', authenticateToken, authorizeRole(['artisan', 'admin']), updateProduct);

// DELETE /api/products/:id - Menghapus produk

router.delete('/:id', authenticateToken, authorizeRole(['artisan', 'admin']), deleteProduct);

export default router;