// prisma/seed.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Admin user
  const hashedPassword = await bcrypt.hash('linh', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@gmail.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@gmail.com',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  // Categories
  const electronics = await prisma.category.upsert({
    where: { name: 'Electronics' },
    update: {},
    create: { name: 'Electronics' },
  });

  const tools = await prisma.category.upsert({
    where: { name: 'Tools' },
    update: {},
    create: { name: 'Tools' },
  });

  // Locations
  const warehouseA = await prisma.location.upsert({
    where: { name: 'Warehouse A' },
    update: {},
    create: { name: 'Warehouse A', address: 'Building 1, Floor 1' },
  });

  // Items
  await prisma.item.createMany({
    skipDuplicates: true,
    data: [
      {
        name: 'Laptop Dell XPS 15',
        description: 'High performance laptop',
        quantity: 10,
        minQuantity: 2,
        categoryId: electronics.id,
        locationId: warehouseA.id,
      },
      {
        name: 'Network Switch 24-port',
        description: 'Cisco Catalyst 24-port',
        quantity: 5,
        minQuantity: 1,
        categoryId: electronics.id,
        locationId: warehouseA.id,
      },
      {
        name: 'Screwdriver Set',
        description: 'Professional 32-piece set',
        quantity: 8,
        minQuantity: 2,
        categoryId: tools.id,
        locationId: warehouseA.id,
      },
    ],
  });

  console.log('✅ Seed completed');
  console.log(`👤 Admin: admin@gmail.com / linh`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });