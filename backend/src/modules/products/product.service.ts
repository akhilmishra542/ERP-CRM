import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma";
import { ApiError } from "../../utils/ApiError";

interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  lowStock?: boolean;
}

export async function listProducts(params: ListParams) {
  const page = params.page || 1;
  const limit = params.limit || 20;
  const skip = (page - 1) * limit;

  const where: Prisma.ProductWhereInput = {
    ...(params.category ? { category: params.category } : {}),
    ...(params.search
      ? {
          OR: [
            { name: { contains: params.search, mode: "insensitive" } },
            { sku: { contains: params.search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  let items = await prisma.product.findMany({
    where,
    skip,
    take: limit,
    orderBy: { createdAt: "desc" },
  });

  if (params.lowStock) {
    items = items.filter((p) => p.currentStock <= p.minStockAlert);
  }

  const total = await prisma.product.count({ where });

  return {
    items,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getProductById(id: string) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw ApiError.notFound("Product not found");
  return product;
}

export async function createProduct(data: {
  name: string;
  sku: string;
  category?: string | null;
  unitPrice: number;
  currentStock: number;
  minStockAlert: number;
  warehouseLoc?: string | null;
}) {
  const existingSku = await prisma.product.findUnique({ where: { sku: data.sku } });
  if (existingSku) throw ApiError.conflict("A product with this SKU already exists");

  return prisma.product.create({ data });
}

export async function updateProduct(id: string, data: Prisma.ProductUpdateInput) {
  const existing = await prisma.product.findUnique({ where: { id } });
  if (!existing) throw ApiError.notFound("Product not found");

  return prisma.product.update({ where: { id }, data });
}

/**
 * Records a manual stock movement (IN or OUT) and adjusts currentStock.
 * Used for warehouse restocks, corrections, damage write-offs, etc.
 * Challan confirmation uses its own transactional logic (see challan.service.ts)
 * rather than this function, since it also needs to create challan items atomically.
 */
export async function recordStockMovement(
  productId: string,
  quantity: number,
  movementType: "IN" | "OUT",
  reason: string | null | undefined,
  createdById?: string
) {
  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findUnique({ where: { id: productId } });
    if (!product) throw ApiError.notFound("Product not found");

    const newStock =
      movementType === "IN" ? product.currentStock + quantity : product.currentStock - quantity;

    if (newStock < 0) {
      throw ApiError.badRequest(
        `Insufficient stock. Current stock: ${product.currentStock}, requested OUT: ${quantity}`
      );
    }

    const [updatedProduct, movement] = await Promise.all([
      tx.product.update({ where: { id: productId }, data: { currentStock: newStock } }),
      tx.stockMovement.create({
        data: {
          productId,
          quantity,
          movementType,
          reason: reason || undefined,
          createdById,
        },
      }),
    ]);

    return { product: updatedProduct, movement };
  });
}

export async function listMovementsForProduct(productId: string, page = 1, limit = 20) {
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) throw ApiError.notFound("Product not found");

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    prisma.stockMovement.findMany({
      where: { productId },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { createdBy: { select: { id: true, name: true, email: true } } },
    }),
    prisma.stockMovement.count({ where: { productId } }),
  ]);

  return { items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}
