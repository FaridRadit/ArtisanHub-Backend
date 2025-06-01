import express from 'express';
import { registerUser, loginUser, logoutUser, getProfile, updateProfile } from '../Controller/AuthController.js';
import { authenticateToken } from '../Middleware/authMiddleware.js'; // Hanya authenticateToken yang diperlukan di sini

const router = express.Router();

// POST /api/auth/register
router.post('/register', registerUser);

// POST /api/auth/login
router.post('/login', loginUser);

router.post('/logout', logoutUser);

// GET /api/auth/profile - Memerlukan autentikasi
router.get('/profile', authenticateToken, getProfile);

// PUT /api/auth/profile - Memerlukan autentikasi
router.put('/profile', authenticateToken, updateProfile);

export default router;