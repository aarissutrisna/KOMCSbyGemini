
import express from 'express';
import { requestWithdrawal, getWithdrawalHistory } from '../controllers/withdrawalController.js';
import { verifyToken, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/history', verifyToken, getWithdrawalHistory);
router.post('/request', verifyToken, authorize(['CS']), requestWithdrawal);

export default router;
