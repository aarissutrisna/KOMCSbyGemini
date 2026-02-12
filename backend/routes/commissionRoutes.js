
import express from 'express';
import { getStats, getHistory, createCommission } from '../controllers/commissionController.js';
import { verifyToken, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/stats', verifyToken, getStats);
router.get('/history', verifyToken, getHistory);
router.post('/mutate', verifyToken, authorize(['ADMIN', 'HRD']), createCommission);

export default router;
