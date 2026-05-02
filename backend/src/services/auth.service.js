// src/services/auth.service.js
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma/client.js';
import { AppError, Conflict, Unauthorized } from '../utils/AppError.js';

const SALT_ROUNDS = 12;

const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// ─────────────────────────────────────────
export const registerUser = async ({ name, email, password, role }) => {
  // Check existing email
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Conflict('Email already registered');

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: { name, email, password: hashedPassword, role },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  const token = generateToken(user.id, user.role);
  return { user, token };
};

// ─────────────────────────────────────────
export const loginUser = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });

  // Generic message to prevent user enumeration
  if (!user) throw  Unauthorized('Invalid email or password');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw Unauthorized('Invalid email or password');

  const token = generateToken(user.id, user.role);

  const { password: _, ...safeUser } = user;
  return { user: safeUser, token };
};

// ─────────────────────────────────────────
export const getProfile = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });
  if (!user) throw new AppError('User not found', 404);
  return user;
};
