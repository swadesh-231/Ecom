import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { clerkMiddleware } from "@clerk/express";

import { errorHandler, notFound } from "./middlewares/error.middleware.js";
import { stripeWebhook } from "./controller/checkout.controller.js";

import authRouter from "./routes/auth.routes.js";
import productRouter from "./routes/product.routes.js";
import orderRouter from "./routes/order.routes.js";
import reviewRouter from "./routes/review.routes.js";
import checkoutRouter from "./routes/checkout.routes.js";

const app = express();

// CORS — allow the configured frontend origin(s) with credentials so Clerk
// session cookies/headers flow through.
app.use(
  cors({
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
      : "*",
    credentials: true,
  }),
);

// Stripe webhook MUST receive the raw, unparsed body for signature verification,
// so it is mounted before the JSON body parser below.
app.post(
  "/api/v1/checkout/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook,
);

// Body parsers (for every other route)
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Clerk — attaches auth context to every request (reads CLERK_* env vars).
app.use(clerkMiddleware());

// Health check
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({ success: true, message: "API is running" });
});

// Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/checkout", checkoutRouter);

// 404 + centralized error handling (must be last)
app.use(notFound);
app.use(errorHandler);

export default app;
