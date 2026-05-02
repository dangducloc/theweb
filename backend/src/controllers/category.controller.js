// src/controllers/category.controller.js
import * as categoryService from '../services/category.service.js';
import { sendSuccess, sendCreated } from '../utils/response.js';

export const getCategories = async (req, res, next) => {
  try {
    const data = await categoryService.getAllCategories();
    return sendSuccess(res, data);
  } catch (err) { next(err); }
};

export const getCategory = async (req, res, next) => {
  try {
    const data = await categoryService.getCategoryById(req.params.id);
    return sendSuccess(res, data);
  } catch (err) { next(err); }
};

export const createCategory = async (req, res, next) => {
  try {
    const data = await categoryService.createCategory(req.body);
    return sendCreated(res, data, 'Category created');
  } catch (err) { next(err); }
};

export const updateCategory = async (req, res, next) => {
  try {
    const data = await categoryService.updateCategory(req.params.id, req.body);
    return sendSuccess(res, data, 'Category updated');
  } catch (err) { next(err); }
};

export const deleteCategory = async (req, res, next) => {
  try {
    await categoryService.deleteCategory(req.params.id);
    return sendSuccess(res, null, 'Category deleted');
  } catch (err) { next(err); }
};
