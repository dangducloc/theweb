// src/controllers/item.controller.js
import * as itemService from '../services/item.service.js';
import { sendSuccess, sendCreated, sendPaginated } from '../utils/response.js';

// ─────────────────────────────────────────
export const getItems = async (req, res, next) => {
  try {
    const { page, limit, search, categoryId, locationId } = req.query;
    const result = await itemService.getAllItems({ page, limit, search, categoryId, locationId });
    return sendPaginated(res, result.items, result.meta);
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
export const getItem = async (req, res, next) => {
  try {
    const item = await itemService.getItemById(req.params.id);
    return sendSuccess(res, item);
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
export const createItem = async (req, res, next) => {
  try {
    const item = await itemService.createItem(req.body);
    return sendCreated(res, item, 'Item created successfully');
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
export const updateItem = async (req, res, next) => {
  try {
    const item = await itemService.updateItem(req.params.id, req.body);
    return sendSuccess(res, item, 'Item updated successfully');
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
export const deleteItem = async (req, res, next) => {
  try {
    await itemService.deleteItem(req.params.id);
    return sendSuccess(res, null, 'Item deleted successfully');
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
export const getLowStock = async (req, res, next) => {
  try {
    const items = await itemService.getLowStockItems();
    return sendSuccess(res, items, 'Low stock items');
  } catch (err) {
    next(err);
  }
};
