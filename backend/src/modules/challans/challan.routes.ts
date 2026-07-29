import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import {
  createChallanSchema,
  changeStatusSchema,
  listChallansQuerySchema,
} from "./challan.schema";
import * as challanController from "./challan.controller";

const router = Router();

router.use(authenticate);

router.get("/", validate(listChallansQuerySchema), challanController.listChallans);
router.get("/:id", challanController.getChallan);

// Sales creates challans; Admin can too
router.post(
  "/",
  authorize("ADMIN", "SALES"),
  validate(createChallanSchema),
  challanController.createChallan
);

router.post(
  "/:id/confirm",
  authorize("ADMIN", "SALES", "WAREHOUSE"),
  validate(changeStatusSchema),
  challanController.confirmChallan
);

router.post(
  "/:id/cancel",
  authorize("ADMIN", "SALES", "WAREHOUSE"),
  validate(changeStatusSchema),
  challanController.cancelChallan
);

export default router;
