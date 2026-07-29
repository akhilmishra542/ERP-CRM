import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as challanService from "./challan.service";

export const listChallans = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, status, customerId, search } = req.query as Record<string, string>;
  const result = await challanService.listChallans({
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    status: status as any,
    customerId,
    search,
  });
  res.json({ success: true, data: result.items, pagination: result.pagination });
});

export const getChallan = asyncHandler(async (req: Request, res: Response) => {
  const challan = await challanService.getChallanById(req.params.id);
  res.json({ success: true, data: challan });
});

export const createChallan = asyncHandler(async (req: Request, res: Response) => {
  const { customerId, items, status } = req.body;
  const challan = await challanService.createChallan({
    customerId,
    items,
    status,
    createdById: req.user?.id,
  });
  res.status(201).json({ success: true, data: challan });
});

export const confirmChallan = asyncHandler(async (req: Request, res: Response) => {
  const challan = await challanService.confirmChallan(req.params.id, req.user?.id);
  res.json({ success: true, data: challan });
});

export const cancelChallan = asyncHandler(async (req: Request, res: Response) => {
  const challan = await challanService.cancelChallan(req.params.id, req.user?.id);
  res.json({ success: true, data: challan });
});
