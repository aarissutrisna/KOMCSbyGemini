
import jwt from 'jsonwebtoken';
import { sendError } from '../utils/response.js';

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return sendError(res, 'Sesi tidak ditemukan, silakan login kembali', 401);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Berisi { id, role, branchId }
    next();
  } catch (error) {
    return sendError(res, 'Sesi tidak valid atau telah berakhir', 401);
  }
};

/**
 * Middleware untuk membatasi akses berdasarkan Role
 * @param {Array} roles - Role yang diizinkan (ADMIN, HRD, CS)
 */
export const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return sendError(res, 'Anda tidak memiliki hak akses untuk fitur ini', 403);
    }
    next();
  };
};
