import { Router } from "express";
import { authenticate, authorize } from "../../middleware/auth";
import { validate } from "../../middleware/validate";
import {
  createCustomerSchema,
  updateCustomerSchema,
  listCustomersQuerySchema,
  addFollowUpSchema,
} from "./customer.schema";
import * as customerController from "./customer.controller";

const router = Router();

// All customer routes require login. Admin + Sales can create/edit;
// Warehouse/Accounts have read-only access for context on orders/payments.
router.use(authenticate);

router.get("/", validate(listCustomersQuerySchema), customerController.listCustomers);
router.get("/:id", customerController.getCustomer);

router.post(
  "/",
  authorize("ADMIN", "SALES"),
  validate(createCustomerSchema),
  customerController.createCustomer
);

router.put(
  "/:id",
  authorize("ADMIN", "SALES"),
  validate(updateCustomerSchema),
  customerController.updateCustomer
);

router.post(
  "/:id/follow-up",
  authorize("ADMIN", "SALES"),
  validate(addFollowUpSchema),
  customerController.addFollowUp
);

export default router;
