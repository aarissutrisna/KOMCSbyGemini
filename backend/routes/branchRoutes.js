
import express from 'express';
import { getAllBranches, createBranch, updateBranch, deleteBranch } from '../controllers/branchController.js';
import { verifyToken, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', verifyToken, getAllBranches);
router.post('/', verifyToken, authorize(['ADMIN']), createBranch);
router.put('/:id', verifyToken, authorize(['ADMIN']), updateBranch);
router.delete('/:id', verifyToken, authorize(['ADMIN']), deleteBranch);

export default router;
