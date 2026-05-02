// src/controllers/user.controller.js
import * as userService from '../services/user.service.js';
import { sendSuccess, sendCreated } from '../utils/response.js';

export const getUsers = async (req, res, next) => {
  try {
    const { search, role } = req.query;
    const data = await userService.getAllUsers({ search, role });
    return sendSuccess(res, data);
  } catch (err) { next(err); }
};

export const getUser = async (req, res, next) => {
  try {
    const data = await userService.getUserById(req.params.id);
    return sendSuccess(res, data);
  } catch (err) { next(err); }
};

export const createUser = async (req, res, next) => {
  try {
    const data = await userService.createUser(req.body);
    return sendCreated(res, data, 'User created');
  } catch (err) { next(err); }
};

export const updateUser = async (req, res, next) => {
  try {
    const data = await userService.updateUser(req.params.id, req.body);
    return sendSuccess(res, data, 'User updated');
  } catch (err) { next(err); }
};

export const deleteUser = async (req, res, next) => {
  try {
    await userService.deleteUser(req.params.id, req.user.id);
    return sendSuccess(res, null, 'User deleted');
  } catch (err) { next(err); }
};