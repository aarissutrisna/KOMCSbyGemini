
import db from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';
import { sendSuccess, sendError } from '../utils/response.js';

export const getAllBranches = async (req, res) => {
  try {
    const [rows] = await db.execute('SELECT * FROM branches WHERE deleted_at IS NULL ORDER BY name ASC');
    return sendSuccess(res, 'Branches fetched successfully', rows);
  } catch (error) {
    return sendError(res, error.message);
  }
};

export const createBranch = async (req, res) => {
  const { name, targetMin, targetMax, n8nEndpoint } = req.body;

  try {
    const id = uuidv4();
    await db.execute(
      'INSERT INTO branches (id, name, target_min, target_max, n8n_endpoint) VALUES (?, ?, ?, ?, ?)',
      [id, name, targetMin, targetMax, n8nEndpoint]
    );

    await db.execute(
      'INSERT INTO audit_logs (id, user_id, action, details) VALUES (?, ?, ?, ?)',
      [uuidv4(), req.user.id, 'CREATE_BRANCH', JSON.stringify({ id, name })]
    );

    return sendSuccess(res, 'Branch created successfully', { id }, 201);
  } catch (error) {
    return sendError(res, error.message);
  }
};

export const updateBranch = async (req, res) => {
  const { id } = req.params;
  const { name, targetMin, targetMax, n8nEndpoint } = req.body;

  try {
    await db.execute(
      'UPDATE branches SET name = ?, target_min = ?, target_max = ?, n8n_endpoint = ? WHERE id = ? AND deleted_at IS NULL',
      [name, targetMin, targetMax, n8nEndpoint, id]
    );

    return sendSuccess(res, 'Branch updated successfully');
  } catch (error) {
    return sendError(res, error.message);
  }
};

export const deleteBranch = async (req, res) => {
  const { id } = req.params;

  try {
    await db.execute('UPDATE branches SET deleted_at = NOW() WHERE id = ?', [id]);
    return sendSuccess(res, 'Branch deleted successfully (Soft Delete)');
  } catch (error) {
    return sendError(res, error.message);
  }
};
