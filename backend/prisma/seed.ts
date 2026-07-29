import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const passwordHash = await bcrypt.hash("Password123!", 10);

  const [admin, sales, warehouse, accounts] = await Promise.all([
    prisma.user.upsert({
      where: { email: "admin@erp.com" },
      update: {},
      create: { name: "Admin User", email: "admin@erp.com", passwordHash, role: "ADMIN" },
    }),
    prisma.user.upsert({
      where: { email: "sales@erp.com" },
      update: {},
      create: { name: "Sales User", email: "sales@erp.com", passwordHash, role: "SALES" },
    }),
    prisma.user.upsert({
      where: { email: "warehouse@erp.com" },
      update: {},
      create: { name: "Warehouse User", email: "warehouse@erp.com", passwordHash, role: "WAREHOUSE" },
    }),
    prisma.user.upsert({
      where: { email: "accounts@erp.com" },
      update: {},
      create: { name: "Accounts User", email: "accounts@erp.com", passwordHash, role: "ACCOUNTS" },
    }),
  ]);

  const customer = await prisma.customer.upsert({
    where: { id: "seed-customer-1" },
    update: {},
    create: {
      id: "seed-customer-1",
      name: "Ramesh Traders",
      mobile: "9876543210",
      email: "ramesh@traders.com",
      businessName: "Ramesh Traders Pvt Ltd",
      gstNumber: "27ABCDE1234F1Z5",
      customerType: "WHOLESALE",
      address: "MG Road, Lucknow, UP",
      status: "ACTIVE",
      notes: "Regular bulk buyer, pays on 30-day credit.",
      createdById: sales.id,
    },
  });

  const product1 = await prisma.product.upsert({
    where: { sku: "SKU-001" },
    update: {},
    create: {
      name: "Steel Rod 10mm",
      sku: "SKU-001",
      category: "Raw Material",
      unitPrice: 450.0,
      currentStock: 500,
      minStockAlert: 50,
      warehouseLoc: "Warehouse A - Rack 3",
    },
  });

  const product2 = await prisma.product.upsert({
    where: { sku: "SKU-002" },
    update: {},
    create: {
      name: "Cement Bag 50kg",
      sku: "SKU-002",
      category: "Building Material",
      unitPrice: 380.0,
      currentStock: 200,
      minStockAlert: 30,
      warehouseLoc: "Warehouse B - Rack 1",
    },
  });

  await prisma.stockMovement.createMany({
    data: [
      {
        productId: product1.id,
        quantity: 500,
        movementType: "IN",
        reason: "Initial stock",
        createdById: warehouse.id,
      },
      {
        productId: product2.id,
        quantity: 200,
        movementType: "IN",
        reason: "Initial stock",
        createdById: warehouse.id,
      },
    ],
  });

  console.log("Seed complete.");
  console.log("Test logins (password for all: Password123!):");
  console.log(`  Admin:     ${admin.email}`);
  console.log(`  Sales:     ${sales.email}`);
  console.log(`  Warehouse: ${warehouse.email}`);
  console.log(`  Accounts:  ${accounts.email}`);
  console.log(`Sample customer: ${customer.name} (${customer.id})`);
  console.log(`Sample products: ${product1.name}, ${product2.name}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
