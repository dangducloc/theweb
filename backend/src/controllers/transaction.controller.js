// src/controllers/transaction.controller.js
import * as txService from '../services/transaction.service.js';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/response.js';

// ─────────────────────────────────────────
export const borrow = async (req, res, next) => {
  try {
    const result = await txService.borrowItem({
      ...req.body,
      userId: req.user.id, // from JWT
    });
    return sendCreated(res, result, 'Item borrowed successfully');
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
export const returnItem = async (req, res, next) => {
  try {
    const result = await txService.returnItem({
      ...req.body,
      userId: req.user.id,
    });
    return sendSuccess(res, result, 'Item returned successfully');
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
export const getTransactions = async (req, res, next) => {
  try {
    const { page, limit, type, itemId, userId } = req.query;
    const result = await txService.getAllTransactions({ page, limit, type, itemId, userId });
    return sendPaginated(res, result.transactions, result.meta);
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
export const getTransaction = async (req, res, next) => {
  try {
    const tx = await txService.getTransactionById(req.params.id);
    return sendSuccess(res, tx);
  } catch (err) {
    next(err);
  }
};
