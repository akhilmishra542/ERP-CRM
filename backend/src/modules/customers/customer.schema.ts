import { z } from "zod";

const customerBase = {
  name: z.string().min(2),
  mobile: z.string().min(7, "Mobile number looks too short"),
  email: z.string().email().optional().nullable(),
  businessName: z.string().optional().nullable(),
  gstNumber: z.string().optional().nullable(),
  customerType: z.enum(["RETAIL", "WHOLESALE", "DISTRIBUTOR"]).default("RETAIL"),
  address: z.string().optional().nullable(),
  status: z.enum(["LEAD", "ACTIVE", "INACTIVE"]).default("LEAD"),
  followUpDate: z.coerce.date().optional().nullable(),
  notes: z.string().optional().nullable(),
};

export const createCustomerSchema = z.object({
  body: z.object(customerBase),
});

export const updateCustomerSchema = z.object({
  body: z.object(customerBase).partial(),
  params: z.object({ id: z.string() }),
});

export const listCustomersQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().min(1).optional(),
    limit: z.coerce.number().min(1).max(100).optional(),
    search: z.string().optional(),
    status: z.enum(["LEAD", "ACTIVE", "INACTIVE"]).optional(),
    customerType: z.enum(["RETAIL", "WHOLESALE", "DISTRIBUTOR"]).optional(),
  }),
});

export const addFollowUpSchema = z.object({
  body: z.object({
    note: z.string().min(1, "Note cannot be empty"),
  }),
  params: z.object({ id: z.string() }),
});
