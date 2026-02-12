
import db from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { sendSuccess, sendError } from '../utils/response.js';

export const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await db.execute(
      'SELECT * FROM users WHERE username = ? AND deleted_at IS NULL',
      [username]
    );

    if (rows.length === 0) return sendError(res, 'User tidak ditemukan', 404);
    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return sendError(res, 'Kredensial tidak valid', 400);

    const token = jwt.sign(
      { id: user.id, role: user.role, branchId: user.branch_id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    // Deteksi IP Publik Asli (Support Cloudflare & Proxies)
    const realIp = req.headers['cf-connecting-ip'] || 
                   req.headers['x-forwarded-for']?.split(',')[0] || 
                   req.ip;

    // Audit Log dengan IP Asli
    await db.execute(
      'INSERT INTO audit_logs (id, user_id, action, details, ip_address) VALUES (?, ?, ?, ?, ?)',
      [uuidv4(), user.id, 'LOGIN', JSON.stringify({ user_agent: req.headers['user-agent'] }), realIp]
    );

    return sendSuccess(res, 'Login berhasil', {
      token,
      user: { id: user.id, username: user.username, name: user.nama, role: user.role }
    });
  } catch (error) {
    return sendError(res, error.message);
  }
};
