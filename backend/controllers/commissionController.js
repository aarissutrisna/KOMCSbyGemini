
import db from '../config/db.js';
import redis from '../config/redis.js';
import { v4 as uuidv4 } from 'uuid';
import { sendSuccess, sendError } from '../utils/response.js';

export const getStats = async (req, res) => {
  const { branchId, userId } = req.query;
  try {
    // Ambil saldo terakhir dari mutasi
    const [rows] = await db.execute(
      'SELECT saldo_after FROM commission_mutations WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
      [userId || req.user.id]
    );
    const balance = rows.length > 0 ? parseInt(rows[0].saldo_after) : 0;
    return sendSuccess(res, 'Stats fetched', { current_balance: balance });
  } catch (error) {
    return sendError(res, error.message);
  }
};

export const getHistory = async (req, res) => {
  const userId = req.query.userId || req.user.id;
  try {
    const [rows] = await db.execute(
      'SELECT id, tanggal, tipe, nominal, saldo_after, keterangan FROM commission_mutations WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return sendSuccess(res, 'History fetched', rows);
  } catch (error) {
    return sendError(res, error.message);
  }
};

export const createCommission = async (req, res) => {
  const { userId, tanggal, amount, type, note } = req.body;
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [last] = await connection.execute(
      'SELECT saldo_after FROM commission_mutations WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
      [userId]
    );
    const currentSaldo = last.length > 0 ? parseInt(last[0].saldo_after) : 0;
    const newSaldo = type === 'IN' ? currentSaldo + parseInt(amount) : currentSaldo - parseInt(amount);
    const id = uuidv4();
    await connection.execute(
      'INSERT INTO commission_mutations (id, user_id, tanggal, tipe, nominal, saldo_after, keterangan) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, userId, tanggal, type, amount, newSaldo, note]
    );
    await connection.commit();
    return sendSuccess(res, 'Mutation recorded', { id, saldo_after: newSaldo });
  } catch (error) {
    await connection.rollback();
    return sendError(res, error.message);
  } finally {
    connection.release();
  }
};
