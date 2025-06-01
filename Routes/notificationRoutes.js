import express from 'express';
import {
    registerDeviceToken,
    getNotifications,
    markNotificationAsRead
} from '../Controller/NotificationController.js';
import { authenticateToken } from '../Middleware/authMiddleware.js';

const router = express.Router();

router.post('/register-token', authenticateToken, registerDeviceToken);
router.get('/', authenticateToken, getNotifications);
router.put('/:id/read', authenticateToken, markNotificationAsRead);

export default router;