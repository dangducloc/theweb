// src/services/category.service.js
import { prisma } from '../prisma/client.js';
import { NotFound, Conflict } from '../utils/AppError.js';

// ─────────────────────────────────────────
export const getAllCategories = async () => {
  return prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { items: true } },
    },
  });
};

// ─────────────────────────────────────────
export const getCategoryById = async (id) => {
  const category = await prisma.category.findUnique({
    where: { id: Number(id) },
    include: {
      items: {
        select: { id: true, name: true, quantity: true },
        take: 20,
      },
      _count: { select: { items: true } },
    },
  });
  if (!category) throw new NotFound(`Category #${id} not found`);
  return category;
};

// ─────────────────────────────────────────
export const createCategory = async ({ name }) => {
  const existing = await prisma.category.findUnique({ where: { name } });
  if (existing) throw new Conflict(`Category "${name}" already exists`);

  return prisma.category.create({ data: { name } });
};

// ─────────────────────────────────────────
export const updateCategory = async (id, { name }) => {
  await getCategoryById(id);
  return prisma.category.update({
    where: { id: Number(id) },
    data: { name },
  });
};

// ─────────────────────────────────────────
export const deleteCategory = async (id) => {
  const category = await getCategoryById(id);

  // Prevent delete if items exist
  if (category._count.items > 0) {
    throw new Error(`Cannot delete: category has ${category._count.items} items`);
  }

  return prisma.category.delete({ where: { id: Number(id) } });
};
