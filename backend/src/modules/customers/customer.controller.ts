import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as customerService from "./customer.service";

export const listCustomers = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, search, status, customerType } = req.query as Record<string, string>;
  const result = await customerService.listCustomers({
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    search,
    status: status as any,
    customerType: customerType as any,
  });
  res.json({ success: true, data: result.items, pagination: result.pagination });
});

export const getCustomer = asyncHandler(async (req: Request, res: Response) => {
  const customer = await customerService.getCustomerById(req.params.id);
  res.json({ success: true, data: customer });
});

export const createCustomer = asyncHandler(async (req: Request, res: Response) => {
  const customer = await customerService.createCustomer(req.body, req.user?.id);
  res.status(201).json({ success: true, data: customer });
});

export const updateCustomer = asyncHandler(async (req: Request, res: Response) => {
  const customer = await customerService.updateCustomer(req.params.id, req.body);
  res.json({ success: true, data: customer });
});

export const addFollowUp = asyncHandler(async (req: Request, res: Response) => {
  const note = await customerService.addFollowUpNote(req.params.id, req.body.note, req.user?.id);
  res.status(201).json({ success: true, data: note });
});
