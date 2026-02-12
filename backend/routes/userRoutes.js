
import express from 'express';
import { getAllUsers, getMyProfile, getUserById, createUser } from '../controllers/userController.js';
import { verifyToken, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Endpoint khusus untuk mengambil data diri sendiri (Semua Role)
router.get('/me', verifyToken, getMyProfile);

// Endpoint daftar user (Controller akan memfilter hasil berdasarkan role)
router.get('/', verifyToken, getAllUsers);

// Endpoint spesifik dengan pengecekan kepemilikan/otorisasi di level controller
router.get('/:id', verifyToken, getUserById);

// Tambah user baru (Hanya ADMIN)
router.post('/', verifyToken, authorize(['ADMIN']), createUser);

export default router;
