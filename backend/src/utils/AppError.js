// src/utils/AppError.js

export class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // distinguish from programming errors
    Error.captureStackTrace(this, this.constructor);
  }
}

// Helper factories
export const BadRequest = (msg) => new AppError(msg, 400);
export const Unauthorized = (msg) => new AppError(msg, 401);
export const Forbidden = (msg) => new AppError(msg, 403);
export const NotFound = (msg) => new AppError(msg, 404);
export const Conflict = (msg) => new AppError(msg, 409);
export const UnprocessableEntity = (msg) => new AppError(msg, 422);
