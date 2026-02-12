
import express from 'express';
import { saveDailyReport, getDailyReport } from '../controllers/attendanceController.js';
import { verifyToken, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', verifyToken, getDailyReport);
router.post('/', verifyToken, authorize(['ADMIN', 'HRD', 'CS']), saveDailyReport);

export default router;
