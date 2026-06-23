import Stripe from "stripe";
import { ApiError } from "../utils/ApiError.js";

let stripeInstance = null;

/**
 * Lazily create the Stripe client so the server still boots when Stripe isn't
 * configured yet — only checkout endpoints fail (with a clear error) until the
 * STRIPE_SECRET_KEY env var is present.
 */
export const getStripe = () => {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new ApiError(
        500,
        "Stripe is not configured — set STRIPE_SECRET_KEY in your .env",
      );
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripeInstance;
};

/** The frontend base URL used for Stripe success/cancel redirects. */
export const getClientUrl = () => {
  const origin = process.env.CORS_ORIGIN?.split(",")[0]?.trim();
  return origin || "http://localhost:5173";
};
