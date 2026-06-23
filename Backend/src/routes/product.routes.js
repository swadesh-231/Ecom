import { Router } from "express";
import { attachUser } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/admin.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";
import {
  getProducts,
  getCategories,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controller/product.controller.js";

const router = Router();

// Public
router.get("/", getProducts);
router.get("/categories", getCategories);
router.get("/:id", getProductById);

// Admin only (load db user from Clerk session -> require admin role)
const adminGuard = [attachUser, requireAdmin];

router.post("/", adminGuard, upload.array("images", 5), createProduct);
router.patch("/:id", adminGuard, upload.array("images", 5), updateProduct);
router.delete("/:id", adminGuard, deleteProduct);

export default router;
