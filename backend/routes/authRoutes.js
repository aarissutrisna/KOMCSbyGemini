
import express from 'express';
import { login } from '../controllers/authController.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

const loginLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many login attempts. Please try again in a minute.' }
});

router.post('/login', loginLimiter, login);

export default router;
