// src/utils/response.js

export const sendSuccess = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendCreated = (res, data, message = 'Created successfully') => {
  return sendSuccess(res, data, message, 201);
};

export const sendPaginated = (res, data, meta, message = 'Success') => {
  return res.status(200).json({
    success: true,
    message,
    data,
    meta, // { page, limit, total, totalPages }
  });
};
