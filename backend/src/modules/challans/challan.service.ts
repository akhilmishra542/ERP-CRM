import { Prisma, ChallanStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";
import { generateChallanNumber } from "../../utils/generateChallanNumber";

interface ChallanItemInput {
  productId: string;
  quantity: number;
}

interface CreateChallanInput {
  customerId: string;
  items: ChallanItemInput[];
  status: "DRAFT" | "CONFIRMED";
  createdById?: string;
}

/**
 * Creates a challan. If status is CONFIRMED, stock is validated and reduced
 * atomically in the same transaction — if any product has insufficient stock,
 * the whole operation is rolled back and nothing is created or reduced.
 */
export async function createChallan(input: CreateChallanInput) {
  const customer = await prisma.customer.findUnique({ where: { id: input.customerId } });
  if (!customer) throw ApiError.notFound("Customer not found");

  // Merge duplicate product entries in the same request (e.g. same product added twice)
  const mergedItemsMap = new Map<string, number>();
  for (const item of input.items) {
    mergedItemsMap.set(item.productId, (mergedItemsMap.get(item.productId) || 0) + item.quantity);
  }
  const mergedItems = Array.from(mergedItemsMap.entries()).map(([productId, quantity]) => ({
    productId,
    quantity,
  }));

  return prisma.$transaction(async (tx) => {
    const products = await tx.product.findMany({
      where: { id: { in: mergedItems.map((i) => i.productId) } },
    });

    if (products.length !== mergedItems.length) {
      const foundIds = new Set(products.map((p) => p.id));
      const missing = mergedItems.filter((i) => !foundIds.has(i.productId));
      throw ApiError.badRequest("One or more products were not found", {
        missingProductIds: missing.map((m) => m.productId),
      });
    }

    const productMap = new Map(products.map((p) => [p.id, p]));

    // If confirming immediately, validate stock availability BEFORE writing anything.
    if (input.status === "CONFIRMED") {
      const shortages = mergedItems
        .map((item) => {
          const product = productMap.get(item.productId)!;
          return { product, requested: item.quantity, available: product.currentStock };
        })
        .filter((s) => s.requested > s.available);

      if (shortages.length > 0) {
        throw ApiError.badRequest(
          "Insufficient stock for one or more products",
          shortages.map((s) => ({
            productId: s.product.id,
            productName: s.product.name,
            requested: s.requested,
            available: s.available,
          }))
        );
      }
    }

    const challanNumber = await generateChallanNumber();
    const totalQuantity = mergedItems.reduce((sum, i) => sum + i.quantity, 0);

    const challan = await tx.challan.create({
      data: {
        challanNumber,
        customerId: input.customerId,
        status: input.status,
        totalQuantity,
        createdById: input.createdById,
        items: {
          create: mergedItems.map((item) => {
            const product = productMap.get(item.productId)!;
            return {
              productId: product.id,
              productName: product.name,
              productSku: product.sku,
              unitPrice: product.unitPrice,
              quantity: item.quantity,
            };
          }),
        },
      },
      include: { items: true, customer: true },
    });

    // Reduce stock + log movement only when confirmed immediately
    if (input.status === "CONFIRMED") {
      for (const item of mergedItems) {
        const product = productMap.get(item.productId)!;
        await tx.product.update({
          where: { id: product.id },
          data: { currentStock: product.currentStock - item.quantity },
        });
        await tx.stockMovement.create({
          data: {
            productId: product.id,
            quantity: item.quantity,
            movementType: "OUT",
            reason: `Challan ${challan.challanNumber} confirmed`,
            createdById: input.createdById,
          },
        });
      }
    }

    return challan;
  });
}

/**
 * Confirms a DRAFT challan: validates and reduces stock atomically, then flips status.
 * Rejects if the challan is not currently in DRAFT status.
 */
export async function confirmChallan(id: string, userId?: string) {
  return prisma.$transaction(async (tx) => {
    const challan = await tx.challan.findUnique({ where: { id }, include: { items: true } });
    if (!challan) throw ApiError.notFound("Challan not found");
    if (challan.status !== "DRAFT") {
      throw ApiError.badRequest(`Only DRAFT challans can be confirmed. Current status: ${challan.status}`);
    }

    const productIds = challan.items.map((i) => i.productId);
    const products = await tx.product.findMany({ where: { id: { in: productIds } } });
    const productMap = new Map(products.map((p) => [p.id, p]));

    const shortages = challan.items
      .map((item) => {
        const product = productMap.get(item.productId);
        return { item, available: product?.currentStock ?? 0 };
      })
      .filter((s) => s.item.quantity > s.available);

    if (shortages.length > 0) {
      throw ApiError.badRequest(
        "Insufficient stock for one or more products",
        shortages.map((s) => ({
          productId: s.item.productId,
          productName: s.item.productName,
          requested: s.item.quantity,
          available: s.available,
        }))
      );
    }

    for (const item of challan.items) {
      const product = productMap.get(item.productId)!;
      await tx.product.update({
        where: { id: product.id },
        data: { currentStock: product.currentStock - item.quantity },
      });
      await tx.stockMovement.create({
        data: {
          productId: product.id,
          quantity: item.quantity,
          movementType: "OUT",
          reason: `Challan ${challan.challanNumber} confirmed`,
          createdById: userId,
        },
      });
    }

    return tx.challan.update({
      where: { id },
      data: { status: "CONFIRMED" },
      include: { items: true, customer: true },
    });
  });
}

/**
 * Cancels a challan. If it was CONFIRMED, stock is restored (IN movement logged).
 * DRAFT challans can be cancelled with no stock impact since none was ever deducted.
 */
export async function cancelChallan(id: string, userId?: string) {
  return prisma.$transaction(async (tx) => {
    const challan = await tx.challan.findUnique({ where: { id }, include: { items: true } });
    if (!challan) throw ApiError.notFound("Challan not found");
    if (challan.status === "CANCELLED") {
      throw ApiError.badRequest("Challan is already cancelled");
    }

    if (challan.status === "CONFIRMED") {
      for (const item of challan.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { currentStock: { increment: item.quantity } },
        });
        await tx.stockMovement.create({
          data: {
            productId: item.productId,
            quantity: item.quantity,
            movementType: "IN",
            reason: `Challan ${challan.challanNumber} cancelled - stock restored`,
            createdById: userId,
          },
        });
      }
    }

    return tx.challan.update({
      where: { id },
      data: { status: "CANCELLED" },
      include: { items: true, customer: true },
    });
  });
}

interface ListParams {
  page?: number;
  limit?: number;
  status?: ChallanStatus;
  customerId?: string;
  search?: string;
}

export async function listChallans(params: ListParams) {
  const page = params.page || 1;
  const limit = params.limit || 20;
  const skip = (page - 1) * limit;

  const where: Prisma.ChallanWhereInput = {
    ...(params.status ? { status: params.status } : {}),
    ...(params.customerId ? { customerId: params.customerId } : {}),
    ...(params.search ? { challanNumber: { contains: params.search, mode: "insensitive" } } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.challan.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { customer: { select: { id: true, name: true, businessName: true } }, items: true },
    }),
    prisma.challan.count({ where }),
  ]);

  return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function getChallanById(id: string) {
  const challan = await prisma.challan.findUnique({
    where: { id },
    include: { customer: true, items: true, createdBy: { select: { id: true, name: true } } },
  });
  if (!challan) throw ApiError.notFound("Challan not found");
  return challan;
}
