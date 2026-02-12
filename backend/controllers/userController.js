
import db from '../config/db.js';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { sendSuccess, sendError } from '../utils/response.js';

/**
 * Mengambil profil diri sendiri
 * Akses: Semua Role (ADMIN, HRD, CS)
 */
export const getMyProfile = async (req, res) => {
  try {
    const [rows] = await db.execute(
      'SELECT id, username, nama, role, branch_id, faktor_pengali FROM users WHERE id = ?',
      [req.user.id]
    );

    if (rows.length === 0) return sendError(res, 'User tidak ditemukan', 404);
    return sendSuccess(res, 'Profil berhasil dimuat', rows[0]);
  } catch (error) {
    return sendError(res, error.message);
  }
};

/**
 * Mengambil daftar user dengan filter otorisasi
 * ADMIN: Melihat semua user
 * HRD: Melihat user di cabangnya saja
 * CS: Hanya melihat dirinya sendiri dalam list
 */
export const getAllUsers = async (req, res) => {
  const { role, id: userId, branchId } = req.user;

  try {
    let query = 'SELECT id, username, nama, role, branch_id, faktor_pengali FROM users WHERE deleted_at IS NULL';
    const params = [];

    if (role === 'ADMIN') {
      // Tidak ada filter tambahan
    } else if (role === 'HRD') {
      // HRD hanya bisa melihat user yang memiliki branch_id yang sama
      query += ' AND branch_id = ?';
      params.push(branchId);
    } else if (role === 'CS') {
      // CS hanya bisa melihat dirinya sendiri
      query += ' AND id = ?';
      params.push(userId);
    }

    const [rows] = await db.execute(query, params);
    return sendSuccess(res, 'Daftar user berhasil dimuat', rows);
  } catch (error) {
    return sendError(res, error.message);
  }
};

/**
 * Mengambil detail user spesifik dengan proteksi data
 * ADMIN: Bisa akses siapapun
 * HRD: Bisa akses user di cabangnya
 * CS: Hanya bisa akses datanya sendiri
 */
export const getUserById = async (req, res) => {
  const { id } = req.params;
  const { role, id: authUserId, branchId: authBranchId } = req.user;

  try {
    const [rows] = await db.execute(
      'SELECT id, username, nama, role, branch_id, faktor_pengali FROM users WHERE id = ? AND deleted_at IS NULL',
      [id]
    );

    if (rows.length === 0) return sendError(res, 'User tidak ditemukan', 404);
    const targetUser = rows[0];

    // Otorisasi Akses
    if (role === 'ADMIN') {
      // Admin bebas
    } else if (role === 'HRD') {
      // HRD hanya boleh melihat jika user tersebut di cabang yang sama
      if (targetUser.branch_id !== authBranchId) {
        return sendError(res, 'Anda hanya diperbolehkan melihat data di cabang Anda sendiri', 403);
      }
    } else if (role === 'CS') {
      // CS hanya boleh melihat dirinya sendiri
      if (targetUser.id !== authUserId) {
        return sendError(res, 'Akses dilarang. Anda hanya dapat melihat data Anda sendiri', 403);
      }
    }

    return sendSuccess(res, 'Data user ditemukan', targetUser);
  } catch (error) {
    return sendError(res, error.message);
  }
};

/**
 * Membuat user baru
 * Akses: Hanya ADMIN
 */
export const createUser = async (req, res) => {
  const { username, password, nama, role, branchId, faktorPengali } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    const id = uuidv4();
    await db.execute(
      'INSERT INTO users (id, username, password_hash, nama, role, branch_id, faktor_pengali) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, username, hash, nama, role, branchId || null, faktorPengali || null]
    );
    return sendSuccess(res, 'User berhasil dibuat', { id }, 201);
  } catch (error) {
    return sendError(res, error.message);
  }
};
