// src/services/transaction.service.js
import { prisma } from '../prisma/client.js';
import { AppError, NotFound, BadRequest } from '../utils/AppError.js';

const transactionInclude = {
  item: { select: { id: true, name: true, quantity: true } },
  user: { select: { id: true, name: true, email: true } },
};

// ─────────────────────────────────────────
// BORROW ITEM
// ─────────────────────────────────────────
export const borrowItem = async ({ itemId, quantity = 1, note, userId }) => {
  // Use Prisma $transaction for atomicity
  return prisma.$transaction(async (tx) => {
    // 1. Lock & fetch item
    const item = await tx.item.findUnique({
      where: { id: Number(itemId) },
    });

    if (!item) throw new NotFound(`Item #${itemId} not found`);

    // 2. Business rule: quantity must be sufficient
    if (item.quantity <= 0) {
      throw new BadRequest(`Item "${item.name}" is out of stock`);
    }

    if (item.quantity < quantity) {
      throw new BadRequest(
        `Not enough stock. Available: ${item.quantity}, Requested: ${quantity}`
      );
    }

    // 3. Decrement quantity
    const updatedItem = await tx.item.update({
      where: { id: item.id },
      data: { quantity: { decrement: quantity } },
    });

    // 4. Log transaction
    const transaction = await tx.transaction.create({
      data: {
        type: 'BORROW',
        quantity,
        note,
        itemId: item.id,
        userId: Number(userId),
      },
      include: transactionInclude,
    });

    return {
      transaction,
      item: updatedItem,
    };
  });
};

// ─────────────────────────────────────────
// RETURN ITEM
// ─────────────────────────────────────────
export const returnItem = async ({ itemId, quantity = 1, note, userId }) => {
  return prisma.$transaction(async (tx) => {
    // 1. Verify item exists
    const item = await tx.item.findUnique({
      where: { id: Number(itemId) },
    });

    if (!item) throw new NotFound(`Item #${itemId} not found`);

    // 2. Increment quantity
    const updatedItem = await tx.item.update({
      where: { id: item.id },
      data: { quantity: { increment: quantity } },
    });

    // 3. Log transaction
    const transaction = await tx.transaction.create({
      data: {
        type: 'RETURN',
        quantity,
        note,
        itemId: item.id,
        userId: Number(userId),
      },
      include: transactionInclude,
    });

    return {
      transaction,
      item: updatedItem,
    };
  });
};

// ─────────────────────────────────────────
// GET ALL TRANSACTIONS (with filters)
// ─────────────────────────────────────────
export const getAllTransactions = async ({
  page = 1,
  limit = 20,
  type,
  itemId,
  userId,
}) => {
  const skip = (page - 1) * limit;
  const where = {};

  if (type) where.type = type.toUpperCase();
  if (itemId) where.itemId = Number(itemId);
  if (userId) where.userId = Number(userId);

  const [transactions, total] = await prisma.$transaction([
    prisma.transaction.findMany({
      where,
      include: transactionInclude,
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
    }),
    prisma.transaction.count({ where }),
  ]);

  return {
    transactions,
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ─────────────────────────────────────────
// GET TRANSACTION BY ID
// ─────────────────────────────────────────
export const getTransactionById = async (id) => {
  const transaction = await prisma.transaction.findUnique({
    where: { id: Number(id) },
    include: transactionInclude,
  });
  if (!transaction) throw new NotFound(`Transaction #${id} not found`);
  return transaction;
};
