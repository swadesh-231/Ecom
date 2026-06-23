import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { buildOrderItems } from "./order.controller.js";
import { getStripe, getClientUrl } from "../config/stripe.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

/**
 * POST /api/v1/checkout/create-session  (auth)
 * Validates the cart, creates a pending order, and opens a Stripe Checkout
 * session. Returns the hosted checkout URL for the client to redirect to.
 * Stock is decremented later, on the webhook, so abandoned checkouts don't
 * lock inventory.
 */
export const createCheckoutSession = asyncHandler(async (req, res) => {
  const { items: cartItems, address } = req.body;

  if (!address) throw new ApiError(400, "Shipping address is required");

  const { items, totalAmount } = await buildOrderItems(cartItems);

  // Create the order up front in a pending state so the webhook can complete it.
  const order = await Order.create({
    userId: req.user._id,
    items,
    totalAmount,
    address,
    paymentMethod: "card",
    paymentStatus: "pending",
  });

  const stripe = getStripe();
  const clientUrl = getClientUrl();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: req.user.email,
    line_items: items.map((item) => ({
      quantity: item.qty,
      price_data: {
        currency: "inr",
        unit_amount: Math.round(item.price * 100), // amount in paise
        product_data: {
          name: item.name,
          images: item.image ? [item.image] : [],
        },
      },
    })),
    metadata: { orderId: order._id.toString() },
    success_url: `${clientUrl}/order-success?orderId=${order._id}`,
    cancel_url: `${clientUrl}/checkout`,
  });

  // Remember the session so the webhook can reconcile and we can avoid dupes.
  order.stripeSessionId = session.id;
  await order.save();

  return res
    .status(200)
    .json(new ApiResponse(200, { url: session.url, orderId: order._id }));
});

/**
 * POST /api/v1/checkout/webhook
 * Stripe calls this after payment. Mounted with a raw body parser (see app.js)
 * so the signature can be verified. On a completed session we mark the order
 * paid and decrement stock (idempotently).
 */
export const stripeWebhook = asyncHandler(async (req, res) => {
  const stripe = getStripe();
  const signature = req.headers["stripe-signature"];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new ApiError(500, "STRIPE_WEBHOOK_SECRET is not configured");
  }

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
  } catch (err) {
    // Bad signature — respond 400 so Stripe knows it failed.
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;
    const order = orderId ? await Order.findById(orderId) : null;

    // Only act once — guard against duplicate webhook deliveries.
    if (order && order.paymentStatus !== "paid") {
      order.paymentStatus = "paid";
      order.paymentIntentId = session.payment_intent;
      await order.save();

      await Promise.all(
        order.items.map((item) =>
          Product.updateOne(
            { _id: item.productId },
            { $inc: { stock: -item.qty } },
          ),
        ),
      );
    }
  }

  // Acknowledge receipt so Stripe stops retrying.
  return res.status(200).json({ received: true });
});
