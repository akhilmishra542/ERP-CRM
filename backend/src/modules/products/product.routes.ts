import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import {
  createProductSchema,
  updateProductSchema,
  listProductsQuerySchema,
  stockMovementSchema,
  listMovementsQuerySchema,
} from "./product.schema";
import * as productController from "./product.controller";

const router = Router();

router.use(authenticate);

router.get("/", validate(listProductsQuerySchema), productController.listProducts);
router.get("/:id", productController.getProduct);

// Admin + Warehouse manage the catalog and stock
router.post(
  "/",
  authorize("ADMIN", "WAREHOUSE"),
  validate(createProductSchema),
  productController.createProduct
);

router.put(
  "/:id",
  authorize("ADMIN", "WAREHOUSE"),
  validate(updateProductSchema),
  productController.updateProduct
);

router.post(
  "/:id/stock-movements",
  authorize("ADMIN", "WAREHOUSE"),
  validate(stockMovementSchema),
  productController.recordStockMovement
);

router.get(
  "/:id/stock-movements",
  validate(listMovementsQuerySchema),
  productController.listMovements
);

export default router;
