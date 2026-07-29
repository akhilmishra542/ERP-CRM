import { prisma } from "../lib/prisma";

/**
 * Generates a unique, sequential challan number like: CH-2026-0001
 * Uses the count of challans created this year as the running sequence.
 */
export async function generateChallanNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
  const endOfYear = new Date(`${year + 1}-01-01T00:00:00.000Z`);

  const countThisYear = await prisma.challan.count({
    where: {
      createdAt: {
        gte: startOfYear,
        lt: endOfYear,
      },
    },
  });

  const sequence = String(countThisYear + 1).padStart(4, "0");
  const candidate = `CH-${year}-${sequence}`;

  // Extremely unlikely collision guard (e.g. concurrent requests) - fall back to timestamp suffix
  const existing = await prisma.challan.findUnique({ where: { challanNumber: candidate } });
  if (existing) {
    return `${candidate}-${Date.now()}`;
  }
  return candidate;
}
