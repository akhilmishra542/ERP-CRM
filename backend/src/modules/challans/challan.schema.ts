import { z } from "zod";

const challanItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.coerce.number().int().positive("Quantity must be greater than 0"),
});

export const createChallanSchema = z.object({
  body: z.object({
    customerId: z.string().min(1),
    items: z.array(challanItemSchema).min(1, "At least one product is required"),
    status: z.enum(["DRAFT", "CONFIRMED"]).default("DRAFT"),
  }),
});

export const updateChallanSchema = z.object({
  body: z.object({
    customerId: z.string().min(1).optional(),
    items: z.array(challanItemSchema).min(1).optional(),
  }),
  params: z.object({ id: z.string() }),
});

// Separate, explicit endpoints for status transitions rather than a generic PATCH,
// since Confirm/Cancel each carry different business logic (stock reduction, restock).
export const changeStatusSchema = z.object({
  params: z.object({ id: z.string() }),
});

export const listChallansQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).optional(),
    limit: z.coerce.number().min(1).max(100).optional(),
    status: z.enum(["DRAFT", "CONFIRMED", "CANCELLED"]).optional(),
    customerId: z.string().optional(),
    search: z.string().optional(),
  }),
});
