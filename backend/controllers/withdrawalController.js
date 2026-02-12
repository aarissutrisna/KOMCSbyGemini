
import db from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';
import { sendSuccess, sendError } from '../utils/response.js';

export const requestWithdrawal = async (req, res) => {
  const { amount, note } = req.body;
  const userId = req.user.id;

  try {
    // 1. Cek saldo saat ini
    const [rows] = await db.execute(
      'SELECT saldo_after FROM commission_mutations WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
      [userId]
    );
    const currentSaldo = rows.length > 0 ? parseInt(rows[0].saldo_after) : 0;

    if (amount > currentSaldo) {
      return sendError(res, 'Saldo tidak mencukupi', 400);
    }

    if (amount < 50000) {
      return sendError(res, 'Minimal penarikan adalah Rp 50.000', 400);
    }

    const id = uuidv4();
    // Gunakan tabel commission_mutations dengan tipe 'OUT' dan status 'PENDING'
    // Catatan: schema.sql asli tidak punya status di mutations, kita gunakan tabel terpisah atau kolom tambahan.
    // Untuk kesederhanaan sesuai schema.sql, kita catat di audit/log atau buat tabel baru jika diperlukan.
    // Di sini kita asumsikan workflow penarikan butuh pencatatan khusus.
    
    await db.execute(
      'INSERT INTO commission_mutations (id, user_id, tanggal, tipe, nominal, saldo_after, keterangan) VALUES (?, ?, CURDATE(), "OUT", ?, ?, ?)',
      [id, userId, amount, currentSaldo - amount, `[PENDING WD] ${note || ''}`]
    );

    return sendSuccess(res, 'Permintaan penarikan berhasil diajukan', { id });
  } catch (error) {
    return sendError(res, error.message);
  }
};

export const getWithdrawalHistory = async (req, res) => {
  const { role, id: userId, branchId } = req.user;

  try {
    let query = `
      SELECT m.*, u.nama as user_name 
      FROM commission_mutations m
      JOIN users u ON m.user_id = u.id
      WHERE m.tipe = 'OUT'
    `;
    const params = [];

    if (role === 'CS') {
      query += ' AND m.user_id = ?';
      params.push(userId);
    } else if (role === 'HRD') {
      query += ' AND u.branch_id = ?';
      params.push(branchId);
    }

    query += ' ORDER BY m.created_at DESC';
    const [rows] = await db.execute(query, params);
    
    return sendSuccess(res, 'Riwayat penarikan berhasil diambil', rows);
  } catch (error) {
    return sendError(res, error.message);
  }
};
