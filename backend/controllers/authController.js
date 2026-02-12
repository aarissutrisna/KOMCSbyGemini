
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

    if (rows.length === 0) return sendError(res, 'User not found', 404);
    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return sendError(res, 'Invalid credentials', 400);

    const token = jwt.sign(
      { id: user.id, role: user.role, branchId: user.branch_id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    // Audit Log
    await db.execute(
      'INSERT INTO audit_logs (id, user_id, action, details) VALUES (?, ?, ?, ?)',
      [uuidv4(), user.id, 'LOGIN', JSON.stringify({ ip: req.ip })]
    );

    return sendSuccess(res, 'Login success', {
      token,
      user: { id: user.id, username: user.username, name: user.nama, role: user.role }
    });
  } catch (error) {
    return sendError(res, error.message);
  }
};
