import { Router } from "express";
import { attachUser } from "../middlewares/auth.middleware.js";
import {
  getProductReviews,
  createReview,
} from "../controller/review.controller.js";

const router = Router();

router.get("/:productId", getProductReviews);
router.post("/:productId", attachUser, createReview);

export default router;
