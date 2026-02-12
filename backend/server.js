
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Import Routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import branchRoutes from './routes/branchRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import withdrawalRoutes from './routes/withdrawalRoutes.js'; // Tambahkan ini
import commissionRoutes from './routes/commissionRoutes.js'; // Tambahkan ini

dotenv.config();

const app = express();

// Middlewares
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());

// Limit API Requests
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { success: false, message: 'Terlalu banyak permintaan, silakan coba lagi nanti' }
});
app.use('/api/', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/branches', branchRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/withdrawals', withdrawalRoutes);
app.use('/api/commissions', commissionRoutes);

// Base Route
app.get('/', (req, res) => res.json({ name: 'KomCS PJB API', version: '2.1.0', status: 'Production-Ready' }));

// 404 Not Found
app.use((req, res) => res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 KomCS Backend Production-Ready on port ${PORT}`);
});
