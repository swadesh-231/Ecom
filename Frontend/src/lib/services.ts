import api from "./api";
import type {
  AppUser,
  Order,
  OrderStatus,
  Product,
  ProductsResponse,
  Review,
} from "./types";

// Unwrap the standard { data: ... } envelope the backend returns.
const unwrap = async <T>(req: Promise<{ data: { data: T } }>): Promise<T> => {
  const res = await req;
  return res.data.data;
};

/* ---------------- Auth ---------------- */
export const syncUser = () => unwrap<AppUser>(api.post("/auth/sync"));
export const getMe = () => unwrap<AppUser>(api.get("/auth/me"));

/* ---------------- Products ---------------- */
export type ProductQuery = {
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "newest" | "priceLow" | "priceHigh" | "topRated";
  page?: number;
  limit?: number;
};

export const getProducts = (params: ProductQuery = {}) =>
  unwrap<ProductsResponse>(api.get("/products", { params }));

export const getCategories = () =>
  unwrap<string[]>(api.get("/products/categories"));

export const getProduct = (id: string) =>
  unwrap<Product>(api.get(`/products/${id}`));

export const createProduct = (data: FormData) =>
  unwrap<Product>(
    api.post("/products", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  );

export const updateProduct = (id: string, data: FormData) =>
  unwrap<Product>(
    api.patch(`/products/${id}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  );

export const deleteProduct = (id: string) =>
  unwrap<{ id: string }>(api.delete(`/products/${id}`));

/* ---------------- Orders ---------------- */
export type CreateOrderPayload = {
  items: { productId: string; qty: number }[];
  address: {
    fullName: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
  };
};

export const createOrder = (payload: CreateOrderPayload) =>
  unwrap<Order>(api.post("/orders", payload));

export const getMyOrders = () => unwrap<Order[]>(api.get("/orders/mine"));

export const getOrder = (id: string) => unwrap<Order>(api.get(`/orders/${id}`));

export const getAllOrders = () => unwrap<Order[]>(api.get("/orders"));

/* ---------------- Checkout (Stripe) ---------------- */
export const createCheckoutSession = (payload: CreateOrderPayload) =>
  unwrap<{ url: string; orderId: string }>(
    api.post("/checkout/create-session", payload),
  );

export const updateOrderStatus = (id: string, status: OrderStatus) =>
  unwrap<Order>(api.patch(`/orders/${id}/status`, { status }));

/* ---------------- Reviews ---------------- */
export const getReviews = (productId: string) =>
  unwrap<Review[]>(api.get(`/reviews/${productId}`));

export const createReview = (
  productId: string,
  payload: { rating: number; comment: string },
) => unwrap<Review>(api.post(`/reviews/${productId}`, payload));
