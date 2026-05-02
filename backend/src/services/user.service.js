// src/services/user.service.js
import bcrypt from 'bcryptjs';
import { prisma } from '../prisma/client.js';
import { NotFound, Conflict } from '../utils/AppError.js';

const SALT_ROUNDS = 12;

const safeSelect = {
  id: true, name: true, email: true,
  role: true, createdAt: true, updatedAt: true,
};

// ─────────────────────────────────────────
export const getAllUsers = async ({ search, role } = {}) => {
  const where = {};
  if (search) {
    where.OR = [
      { name:  { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (role) where.role = role;

  const users = await prisma.user.findMany({
    where,
    select: safeSelect,
    orderBy: { createdAt: 'desc' },
  });

  return users;
};

// ─────────────────────────────────────────
export const getUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: { id: Number(id) },
    select: safeSelect,
  });
  if (!user) throw new NotFound(`User #${id} not found`);
  return user;
};

// ─────────────────────────────────────────
export const createUser = async ({ name, email, password, role }) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Conflict('Email already registered');

  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  return prisma.user.create({
    data: { name, email, password: hashed, role },
    select: safeSelect,
  });
};

// ─────────────────────────────────────────
export const updateUser = async (id, { name, role, password }) => {
  await getUserById(id);

  const data = {};
  if (name)     data.name = name;
  if (role)     data.role = role;
  if (password) data.password = await bcrypt.hash(password, SALT_ROUNDS);

  return prisma.user.update({
    where: { id: Number(id) },
    data,
    select: safeSelect,
  });
};

// ─────────────────────────────────────────
export const deleteUser = async (id, requesterId) => {
  if (Number(id) === Number(requesterId)) {
    throw new Error('Cannot delete your own account');
  }
  await getUserById(id);
  return prisma.user.delete({ where: { id: Number(id) } });
};