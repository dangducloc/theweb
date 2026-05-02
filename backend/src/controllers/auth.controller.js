// src/controllers/auth.controller.js
import * as authService from '../services/auth.service.js';
import { sendSuccess, sendCreated } from '../utils/response.js';

// ─────────────────────────────────────────
export const register = async (req, res, next) => {
  try {
    const result = await authService.registerUser(req.body);
    return sendCreated(res, result, 'Registration successful');
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
export const login = async (req, res, next) => {
  try {
    const result = await authService.loginUser(req.body);
    return sendSuccess(res, result, 'Login successful');
  } catch (err) {
    next(err);
  }
};

// ─────────────────────────────────────────
export const getMe = async (req, res, next) => {
  try {
    const user = await authService.getProfile(req.user.id);
    return sendSuccess(res, user);
  } catch (err) {
    next(err);
  }
};
