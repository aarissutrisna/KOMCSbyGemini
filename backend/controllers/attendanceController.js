
import db from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';
import { sendSuccess, sendError } from '../utils/response.js';

/**
 * Menyimpan Omzet dan Absensi dalam satu transaksi
 * Body: { branchId, tanggal, totalOmzet, attendances: [{userId, status}, ...] }
 */
export const saveDailyReport = async (req, res) => {
  const { branchId, tanggal, totalOmzet, attendances } = req.body;
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 1. Simpan atau Update Omzet
    const omzetId = uuidv4();
    await connection.execute(
      `INSERT INTO omzet (id, branch_id, tanggal, total, status) 
       VALUES (?, ?, ?, ?, 'DRAFT') 
       ON DUPLICATE KEY UPDATE total = VALUES(total)`,
      [omzetId, branchId, tanggal, totalOmzet]
    );

    // 2. Simpan atau Update Absensi untuk setiap user yang dikirim
    for (const att of attendances) {
      const attId = uuidv4();
      await connection.execute(
        `INSERT INTO attendance (id, user_id, tanggal, status) 
         VALUES (?, ?, ?, ?) 
         ON DUPLICATE KEY UPDATE status = VALUES(status)`,
        [attId, att.userId, tanggal, att.status]
      );
    }

    // 3. Audit Log
    await connection.execute(
      'INSERT INTO audit_logs (id, user_id, action, details) VALUES (?, ?, ?, ?)',
      [uuidv4(), req.user.id, 'SAVE_DAILY_REPORT', JSON.stringify({ branchId, tanggal, totalOmzet })]
    );

    await connection.commit();
    return sendSuccess(res, 'Daily report saved successfully');
  } catch (error) {
    await connection.rollback();
    return sendError(res, error.message);
  } finally {
    connection.release();
  }
};

export const getDailyReport = async (req, res) => {
  const { branchId, tanggal } = req.query;

  try {
    // Ambil Omzet
    const [omzetRows] = await db.execute(
      'SELECT * FROM omzet WHERE branch_id = ? AND tanggal = ? AND deleted_at IS NULL',
      [branchId, tanggal]
    );

    // Ambil Absensi CS di cabang tersebut pada tanggal tersebut
    const [attRows] = await db.execute(
      `SELECT a.*, u.nama 
       FROM attendance a 
       JOIN users u ON a.user_id = u.id 
       WHERE u.branch_id = ? AND a.tanggal = ?`,
      [branchId, tanggal]
    );

    return sendSuccess(res, 'Daily report fetched', {
      omzet: omzetRows[0] || null,
      attendances: attRows
    });
  } catch (error) {
    return sendError(res, error.message);
  }
};
