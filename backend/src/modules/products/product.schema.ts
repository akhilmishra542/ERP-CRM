import { z } from "zod";

const productBase = {
  name: z.string().min(2),
  sku: z.string().min(1),
  category: z.string().optional().nullable(),
  unitPrice: z.coerce.number().positive("Unit price must be positive"),
  minStockAlert: z.coerce.number().int().min(0).default(0),
  warehouseLoc: z.string().optional().nullable(),
};

export const createProductSchema = z.object({
  body: z.object({
    ...productBase,
    currentStock: z.coerce.number().int().min(0).default(0),
  }),
});

export const updateProductSchema = z.object({
  body: z.object(productBase).partial(),
  params: z.object({ id: z.string() }),
});

export const listProductsQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).optional(),
    limit: z.coerce.number().min(1).max(100).optional(),
    search: z.string().optional(),
    category: z.string().optional(),
    lowStock: z.coerce.boolean().optional(),
  }),
});

export const stockMovementSchema = z.object({
  body: z.object({
    quantity: z.coerce.number().int().positive("Quantity must be a positive number"),
    movementType: z.enum(["IN", "OUT"]),
    reason: z.string().optional().nullable(),
  }),
  params: z.object({ id: z.string() }),
});

export const listMovementsQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).optional(),
    limit: z.coerce.number().min(1).max(100).optional(),
  }),
  params: z.object({ id: z.string() }),
});
