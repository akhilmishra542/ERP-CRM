import { Request, Response } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as productService from "./product.service";

export const listProducts = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, search, category, lowStock } = req.query as Record<string, string>;
  const result = await productService.listProducts({
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    search,
    category,
    lowStock: lowStock === "true",
  });
  res.json({ success: true, data: result.items, pagination: result.pagination });
});

export const getProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.getProductById(req.params.id);
  res.json({ success: true, data: product });
});

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.createProduct(req.body);
  res.status(201).json({ success: true, data: product });
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const product = await productService.updateProduct(req.params.id, req.body);
  res.json({ success: true, data: product });
});

export const recordStockMovement = asyncHandler(async (req: Request, res: Response) => {
  const { quantity, movementType, reason } = req.body;
  const result = await productService.recordStockMovement(
    req.params.id,
    quantity,
    movementType,
    reason,
    req.user?.id
  );
  res.status(201).json({ success: true, data: result });
});

export const listMovements = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit } = req.query as Record<string, string>;
  const result = await productService.listMovementsForProduct(
    req.params.id,
    page ? Number(page) : undefined,
    limit ? Number(limit) : undefined
  );
  res.json({ success: true, data: result.items, pagination: result.pagination });
});
