// Shared domain + API types used across the app.

export type ApiEnvelope<T> = {
  statusCode: number;
  data: T;
  message: string;
  success: boolean;
};

export type UserRole = "user" | "admin";

export type AppUser = {
  _id: string;
  clerkId: string;
  email: string;
  name: string;
  avatar?: string;
  role: UserRole;
};

export type ProductImage = {
  url: string;
  publicId?: string;
  _id?: string;
};

export type Product = {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  images: ProductImage[];
  ratings: number;
  numReviews: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Pagination = {
  total: number;
  page: number;
  pages: number;
  limit: number;
};

export type ProductsResponse = {
  products: Product[];
  pagination: Pagination;
};

export type Address = {
  fullName: string;
  street: string;
  city: string;
  postalCode: string;
  country: string;
};

export type OrderItem = {
  productId: string;
  name: string;
  image?: string;
  qty: number;
  price: number;
};

export type OrderStatus = "Pending" | "Shipped" | "Delivered" | "Cancelled";
export type PaymentStatus = "pending" | "paid" | "failed";
export type PaymentMethod = "cod" | "card";

export type Order = {
  _id: string;
  userId: string | { _id: string; name: string; email: string };
  items: OrderItem[];
  totalAmount: number;
  address: Address;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
};

export type Review = {
  _id: string;
  productId: string;
  userId: string;
  name: string;
  rating: number;
  comment: string;
  createdAt: string;
};
