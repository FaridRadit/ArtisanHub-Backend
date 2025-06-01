import express from 'express';
import {
    getAllEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent
} from '../Controller/events.js'; 
import { authenticateToken, authorizeRole } from '../Middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getAllEvents);
router.get('/:id', getEventById);

router.post('/', authenticateToken, authorizeRole(['admin']), createEvent);
router.put('/:id', authenticateToken, authorizeRole(['admin']), updateEvent);
router.delete('/:id', authenticateToken, authorizeRole(['admin']), deleteEvent);

export default router;