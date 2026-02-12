
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
import withdrawalRoutes from './routes/withdrawalRoutes.js';
import commissionRoutes from './routes/commissionRoutes.js';

dotenv.config();

const app = express();

/**
 * OPTIMASI 3-HOP NETWORK (CF > WGHUB > WGCLIENT)
 * Mengizinkan Express membaca header X-Forwarded-* 
 * agar req.ip dan req.protocol akurat meskipun SSL terminasi di WGHUB.
 */
app.set('trust proxy', true); 

// Middlewares
app.use(helmet({
  contentSecurityPolicy: false, // Diperlukan agar tidak konflik dengan proteksi Cloudflare
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

app.use(cors({ 
  origin: process.env.CLIENT_URL || '*',
  credentials: true 
}));

app.use(express.json());

// Limit API Requests - Menggunakan real IP dari X-Forwarded-For
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500, // Menaikkan limit untuk infrastruktur yang lebih stabil
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Terlalu banyak permintaan dari IP Anda' }
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
app.get('/', (req, res) => res.json({ 
  name: 'KomCS PJB API', 
  version: '2.2.0', 
  network: 'Proxy-Aware (3-Hop Optimized)',
  status: 'Running' 
}));

// 404 Not Found
app.use((req, res) => res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan' }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 KomCS Backend v2.2.0 Optimized on port ${PORT}`);
});
