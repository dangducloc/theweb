// src/services/location.service.js
import { prisma } from '../prisma/client.js';
import { NotFound, Conflict } from '../utils/AppError.js';

// ─────────────────────────────────────────
export const getAllLocations = async () => {
  return prisma.location.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: { select: { items: true } },
    },
  });
};

// ─────────────────────────────────────────
export const getLocationById = async (id) => {
  const location = await prisma.location.findUnique({
    where: { id: Number(id) },
    include: {
      items: {
        select: { id: true, name: true, quantity: true },
        take: 20,
      },
      _count: { select: { items: true } },
    },
  });
  if (!location) throw new NotFound(`Location #${id} not found`);
  return location;
};

// ─────────────────────────────────────────
export const createLocation = async ({ name, address }) => {
  const existing = await prisma.location.findUnique({ where: { name } });
  if (existing) throw new Conflict(`Location "${name}" already exists`);

  return prisma.location.create({ data: { name, address } });
};

// ─────────────────────────────────────────
export const updateLocation = async (id, data) => {
  await getLocationById(id);
  return prisma.location.update({
    where: { id: Number(id) },
    data,
  });
};

// ─────────────────────────────────────────
export const deleteLocation = async (id) => {
  const location = await getLocationById(id);

  if (location._count.items > 0) {
    throw new Error(`Cannot delete: location has ${location._count.items} items`);
  }

  return prisma.location.delete({ where: { id: Number(id) } });
};
