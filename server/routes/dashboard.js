import { Router } from 'express';
import { getStats } from '../controllers/dashboardController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Dashboard routes require verified staff authentication
router.use(requireAuth);

// GET /api/dashboard/stats
router.get('/stats', getStats);

export default router;
