// src/services/item.service.js
import { prisma } from '../prisma/client.js';
import { NotFound } from '../utils/AppError.js';

const itemInclude = {
  category: { select: { id: true, name: true } },
  location: { select: { id: true, name: true, address: true } },
};

// ─────────────────────────────────────────
export const getAllItems = async ({ page = 1, limit = 20, search, categoryId, locationId }) => {
  const skip = (page - 1) * limit;

  const where = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (categoryId) where.categoryId = Number(categoryId);
  if (locationId) where.locationId = Number(locationId);

  const [items, total] = await prisma.$transaction([
    prisma.item.findMany({
      where,
      include: itemInclude,
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
    }),
    prisma.item.count({ where }),
  ]);

  return {
    items,
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ─────────────────────────────────────────
export const getItemById = async (id) => {
  const item = await prisma.item.findUnique({
    where: { id: Number(id) },
    include: {
      ...itemInclude,
      transactions: {
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true } },
        },
      },
    },
  });
  if (!item) throw new NotFound(`Item #${id} not found`);
  return item;
};

// ─────────────────────────────────────────
export const createItem = async (data) => {
  return prisma.item.create({
    data,
    include: itemInclude,
  });
};

// ─────────────────────────────────────────
export const updateItem = async (id, data) => {
  await getItemById(id); // throws if not found

  return prisma.item.update({
    where: { id: Number(id) },
    data,
    include: itemInclude,
  });
};

// ─────────────────────────────────────────
export const deleteItem = async (id) => {
  await getItemById(id); // throws if not found

  return prisma.item.delete({
    where: { id: Number(id) },
  });
};

// ─────────────────────────────────────────
export const getLowStockItems = async () => {
  return prisma.item.findMany({
    where: {
      quantity: { lte: prisma.item.fields.minQuantity }, // quantity <= minQuantity
    },
    include: itemInclude,
  });
};
