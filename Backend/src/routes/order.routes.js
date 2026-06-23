import { Router } from "express";
import { attachUser } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/admin.middleware.js";
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
} from "../controller/order.controller.js";

const router = Router();

// Every order route requires authentication.
router.use(attachUser);

// Customer
router.post("/", createOrder);
router.get("/mine", getMyOrders);

// Admin
router.get("/", requireAdmin, getAllOrders);
router.patch("/:id/status", requireAdmin, updateOrderStatus);

// Owner or admin (keep after the more specific routes above)
router.get("/:id", getOrderById);

export default router;
