import express from 'express';
import {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} from '../Controller/productController.js'; // Pastikan path ke Controller benar
import { authenticateToken, authorizeRole } from '../Middleware/authMiddleware.js'; // Pastikan path ke Middleware benar

const router = express.Router();

// GET /api/products - Mendapatkan daftar produk (publik, tidak perlu autentikasi)
router.get('/', getAllProducts);

// GET /api/products/:id - Mendapatkan detail produk (publik, tidak perlu autentikasi)
router.get('/:id', getProductById);


router.post('/', authenticateToken, authorizeRole(['artisan', 'admin']), createProduct);
// PUT /api/products/:id - Memperbarui produk
// Hanya pemilik produk (pengrajin) atau admin yang bisa mengupdate
router.put('/:id', authenticateToken, authorizeRole(['artisan', 'admin']), updateProduct);

// DELETE /api/products/:id - Menghapus produk
router.delete('/:id', authenticateToken, authorizeRole(['artisan', 'admin']), deleteProduct);

export default router;
