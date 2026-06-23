import { Router } from "express";
import { attachUser } from "../middlewares/auth.middleware.js";
import { createCheckoutSession } from "../controller/checkout.controller.js";

const router = Router();

// Starting a checkout requires a signed-in user.
router.post("/create-session", attachUser, createCheckoutSession);

export default router;
