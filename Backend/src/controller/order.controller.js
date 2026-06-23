import { Order } from "../models/order.model.js";
import { Product } from "../models/product.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

/**
 * Resolve cart items against the database: validate stock and recompute prices
 * server-side (never trust client prices). Returns the order line items and
 * total amount. Shared by direct order creation and Stripe checkout.
 */
export const buildOrderItems = async (cartItems) => {
  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    throw new ApiError(400, "Cart is empty");
  }

  const items = [];
  let totalAmount = 0;

  for (const cartItem of cartItems) {
    const product = await Product.findById(cartItem.productId);
    if (!product || !product.isActive) {
      throw new ApiError(404, `Product not available: ${cartItem.productId}`);
    }

    const qty = Number(cartItem.qty);
    if (!qty || qty < 1) {
      throw new ApiError(400, `Invalid quantity for ${product.name}`);
    }
    if (product.stock < qty) {
      throw new ApiError(400, `Insufficient stock for ${product.name}`);
    }

    items.push({
      productId: product._id,
      name: product.name,
      image: product.images[0]?.url,
      qty,
      price: product.price,
    });
    totalAmount += product.price * qty;
  }

  return { items, totalAmount: Math.round(totalAmount * 100) / 100 };
};

/**
 * POST /api/v1/orders  (auth)
 * Places a Cash-on-Delivery order. Stock is decremented immediately and the
 * payment stays "pending" until the order is delivered. (Card payments go
 * through the Stripe checkout flow instead.)
 */
export const createOrder = asyncHandler(async (req, res) => {
  const { items: cartItems, address } = req.body;

  if (!address) {
    throw new ApiError(400, "Shipping address is required");
  }

  const { items, totalAmount } = await buildOrderItems(cartItems);

  // Decrement stock atomically per item.
  for (const item of items) {
    await Product.updateOne(
      { _id: item.productId },
      { $inc: { stock: -item.qty } },
    );
  }

  const order = await Order.create({
    userId: req.user._id,
    items,
    totalAmount,
    address,
    paymentMethod: "cod",
    paymentStatus: "pending",
  });

  return res
    .status(201)
    .json(new ApiResponse(201, order, "Order placed"));
});

/** GET /api/v1/orders/mine  (auth) — the signed-in user's orders. */
export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ userId: req.user._id }).sort({
    createdAt: -1,
  });
  return res.status(200).json(new ApiResponse(200, orders));
});

/** GET /api/v1/orders/:id  (auth) — owner or admin only. */
export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, "Order not found");

  const isOwner = order.userId.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== "admin") {
    throw new ApiError(403, "Not allowed to view this order");
  }

  return res.status(200).json(new ApiResponse(200, order));
});

/** GET /api/v1/orders  (admin) — all orders. */
export const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find()
    .populate("userId", "name email")
    .sort({ createdAt: -1 });
  return res.status(200).json(new ApiResponse(200, orders));
});

/** PATCH /api/v1/orders/:id/status  (admin) — update fulfillment status. */
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const allowed = ["Pending", "Shipped", "Delivered", "Cancelled"];
  if (!allowed.includes(status)) {
    throw new ApiError(400, `Status must be one of: ${allowed.join(", ")}`);
  }

  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, "Order not found");

  order.status = status;

  // Cash is collected on delivery, so mark COD orders paid when delivered.
  if (status === "Delivered" && order.paymentMethod === "cod") {
    order.paymentStatus = "paid";
  }

  await order.save();

  return res
    .status(200)
    .json(new ApiResponse(200, order, "Order status updated"));
});
