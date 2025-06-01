import express from 'express';
import { createProduct } from '../Controller/productController.js';
import {
    getAllArtisans,
    getArtisanById,
    createArtisanProfile,
    updateArtisanProfile,
    deleteArtisanProfile
} from '../Controller/ArtisanController.js';
import { authenticateToken, authorizeRole } from '../Middleware/authMiddleware.js';

const router = express.Router();

// GET /api/artisans - Mendapatkan daftar pengrajin (publik, tidak perlu autentikasi)
router.get('/', getAllArtisans);

// GET /api/artisans/:id - Mendapatkan detail pengrajin (publik, tidak perlu autentikasi)
router.get('/:id', getArtisanById);

// POST /api/artisans - Membuat profil pengrajin baru

router.post('/', authenticateToken, authorizeRole(['artisan', 'admin']), createArtisanProfile);

// PUT /api/artisans/:id - Memperbarui profil pengrajin

router.put('/:id', authenticateToken, authorizeRole(['artisan', 'admin']), updateArtisanProfile);

// DELETE /api/artisans/:id - Menghapus profil pengrajin
router.post('/:artisan_id/products', authenticateToken, authorizeRole(['artisan', 'admin']), createProduct); // <--- Tambahkan baris ini

router.delete('/:id', authenticateToken, authorizeRole(['admin']), deleteArtisanProfile);

export default router;