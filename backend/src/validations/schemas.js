// src/validations/schemas.js
import Joi from 'joi';

// ─────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────
export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .required()
    .messages({
      'string.pattern.base':
        'Password must contain uppercase, lowercase, number, and special character',
    }),
  role: Joi.string().valid('ADMIN', 'STAFF').default('STAFF'),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// ─────────────────────────────────────────
// ITEM
// ─────────────────────────────────────────
export const createItemSchema = Joi.object({
  name: Joi.string().min(2).max(200).required(),
  description: Joi.string().max(1000).optional().allow(''),
  quantity: Joi.number().integer().min(0).required(),
  minQuantity: Joi.number().integer().min(0).default(0),
  imageUrl: Joi.string().uri().optional().allow(''),
  categoryId: Joi.number().integer().positive().required(),
  locationId: Joi.number().integer().positive().required(),
});

export const updateItemSchema = Joi.object({
  name: Joi.string().min(2).max(200),
  description: Joi.string().max(1000).allow(''),
  quantity: Joi.number().integer().min(0),
  minQuantity: Joi.number().integer().min(0),
  imageUrl: Joi.string().uri().allow(''),
  categoryId: Joi.number().integer().positive(),
  locationId: Joi.number().integer().positive(),
}).min(1); // at least 1 field required

// ─────────────────────────────────────────
// CATEGORY
// ─────────────────────────────────────────
export const categorySchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
});

// ─────────────────────────────────────────
// LOCATION
// ─────────────────────────────────────────
export const locationSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  address: Joi.string().max(500).optional().allow(''),
});

// ─────────────────────────────────────────
// TRANSACTION
// ─────────────────────────────────────────
export const borrowSchema = Joi.object({
  itemId: Joi.number().integer().positive().required(),
  quantity: Joi.number().integer().min(1).default(1),
  note: Joi.string().max(500).optional().allow(''),
});

export const returnSchema = Joi.object({
  itemId: Joi.number().integer().positive().required(),
  quantity: Joi.number().integer().min(1).default(1),
  note: Joi.string().max(500).optional().allow(''),
});

// ─────────────────────────────────────────
// UPDATE USER (admin)
// ─────────────────────────────────────────
export const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  role: Joi.string().valid('ADMIN', 'STAFF'),
  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .optional()
    .messages({
      'string.pattern.base': 'Password must contain uppercase, lowercase, number, and special character',
    }),
}).min(1);