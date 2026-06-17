# Backend PRD — MERN E-Commerce Platform

## 1. Overview

This document defines the product requirements for the backend of a full-stack MERN e-commerce application. The backend is a RESTful API server that powers a clothing/fashion store with two distinct user roles: **Customer** and **Admin**.

**Tech Stack**
| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express.js v5 |
| Language | TypeScript |
| Database | MongoDB (via Mongoose v9) |
| Authentication | Clerk (`@clerk/express`) |
| Image Storage | Cloudinary |
| Payment Gateway | Razorpay |
| File Uploads | Multer (memory storage) |
| Validation | Zod + custom helpers |
| Logging | Morgan |
| Environment | dotenv |

---

## 2. Architecture

```
server/
├── src/
│   ├── server.ts              # Entry point — boots DB, mounts routes
│   ├── db.ts                  # MongoDB connection
│   ├── models/                # Mongoose schemas
│   │   ├── User.ts
│   │   ├── Product.ts
│   │   ├── Category.ts
│   │   ├── Cart.ts
│   │   ├── Wishlist.ts
│   │   ├── Order.ts
│   │   ├── Promo.ts
│   │   └── Banner.ts
│   ├── routes/
│   │   ├── auth/              # Auth sync & me
│   │   ├── admin/             # Admin-only routes
│   │   └── customer/          # Customer-facing routes
│   ├── middleware/
│   │   ├── auth.ts            # requireAuth, requireAdmin, getDbUserFromReq
│   │   ├── errorhandler.ts    # Global error handler
│   │   └── notFound.ts        # 404 fallback
│   └── utils/
│       ├── envelope.ts        # { status, data } response wrapper
│       ├── AppError.ts        # Typed operational error
│       ├── asyncHandler.ts    # Express async wrapper
│       ├── helpers.ts         # requireText, requireNumber, requireFound
│       ├── cloudinary.ts      # Image upload helpers
│       └── razorpay.ts        # Razorpay client + currency helpers
```

### Request / Response Contract

Every response uses the envelope pattern:
```json
{ "status": "success", "data": { ... } }
{ "status": "error",   "errors": [{ "message": "..." }] }
```

---

## 3. Data Models

### 3.1 User
| Field | Type | Notes |
|---|---|---|
| `clerkUserId` | String | Unique, indexed — from Clerk |
| `name` | String | Optional |
| `email` | String | Optional |
| `role` | `"user" \| "admin"` | Default `"user"` |
| `points` | Number | Min 0, default 0 — loyalty currency |
| `addresses` | `Address[]` | Embedded subdocuments |

**Address subdocument:** `fullName`, `address`, `state`, `postalCode`, `isDefault`

### 3.2 Product
| Field | Type | Notes |
|---|---|---|
| `title` | String | Required |
| `description` | String | Required |
| `category` | ObjectId → Category | Required |
| `brand` | String | Required |
| `stock` | Number | Min 0 |
| `images` | `ProductImage[]` | `{ url, publicId, isCover }` |
| `colors` | String[] | Hex or name values |
| `sizes` | `("S"\|"M"\|"L"\|"XL")[]` | Enum-validated |
| `price` | Number | Base price in INR |
| `salePercentage` | Number | 0–100; effective price computed at runtime |
| `status` | `"active"\|"inactive"` | Default `"active"` |
| `createdBy` | ObjectId → User | Admin who created it |

### 3.3 Category
| Field | Type |
|---|---|
| `name` | String (required) |

### 3.4 Cart
| Field | Type | Notes |
|---|---|---|
| `user` | ObjectId → User | Unique per user |
| `items` | `CartItem[]` | `{ product, quantity, color?, size? }` |

### 3.5 Wishlist
| Field | Type | Notes |
|---|---|---|
| `user` | ObjectId → User | Unique per user |
| `products` | ObjectId[] → Product | |

### 3.6 Order
| Field | Type | Notes |
|---|---|---|
| `user` | ObjectId → User | |
| `customerName` | String | Snapshot at time of order |
| `customerEmail` | String | Snapshot |
| `items` | `{ product, quantity }[]` | |
| `totalItems` | Number | |
| `deliveryName` | String | From selected address |
| `deliveryAddress` | String | Concatenated street, state, postal |
| `promoCode` | String | Uppercase, optional |
| `discountAmount` | Number | INR |
| `totalAmount` | Number | INR (after discount) |
| `paymentStatus` | `"pending"\|"paid"\|"failed"` | |
| `orderStatus` | `"placed"\|"shipped"\|"delivered"\|"returned"` | |
| `razorpayOrderId` | String | From Razorpay or `points_<ts>` |
| `paymentId` | String | From Razorpay or `points_<ts>` |
| `paidAt` | Date | Null until confirmed |
| `deliveredAt` | Date | Set by admin |
| `returnedAt` | Date | Set by admin |

**Indexes:** `{ user, createdAt }`, `{ orderStatus, createdAt }`, `{ paymentStatus, createdAt }`

### 3.7 Promo
| Field | Type | Notes |
|---|---|---|
| `code` | String | Uppercase, unique |
| `percentage` | Number | 1–100 |
| `count` | Number | Remaining uses; decremented on successful checkout |
| `minimumOrderValue` | Number | INR threshold |
| `startsAt` | Date | |
| `endsAt` | Date | |

### 3.8 Banner
| Field | Type | Notes |
|---|---|---|
| `imageUrl` | String | Cloudinary URL |
| `imagePublicId` | String | For deletion/replacement |
| `createdBy` | ObjectId → User | Admin who uploaded |

---

## 4. Authentication & Authorization

Authentication is delegated to **Clerk**. The `clerkMiddleware()` runs globally on all routes.

### Middleware Chain
- `requireAuth` — verifies Clerk session; throws `401` if unauthenticated
- `requireAdmin` — calls `requireAuth`, then checks `dbUser.role === "admin"`; throws `403` otherwise
- `getDbUserFromReq(req)` — resolves the Clerk `userId` to a MongoDB `User` document

### Role Assignment
Admin roles are seeded via the `ADMIN_EMAILS` environment variable (comma-separated). On every `/auth/sync` call, if the user's email is in `ADMIN_EMAILS`, they receive `role: "admin"`. Existing admins are never demoted.

---

## 5. API Reference

### 5.1 Auth Routes — `/auth`

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/sync` | `requireAuth` | Upsert Clerk user into MongoDB; assigns role |
| GET | `/auth/me` | `requireAuth` | Return current user's DB record |

**POST /auth/sync** — called by the frontend immediately after Clerk login. Creates or updates the user document in MongoDB, resolves role.

**GET /auth/me** — returns `{ id, clerkUserId, email, name, role }`.

---

### 5.2 Admin Routes — `/admin` (all require `requireAdmin`)

#### Categories
| Method | Path | Description |
|---|---|---|
| GET | `/admin/categories` | List all categories sorted by name |
| POST | `/admin/categories` | Create a category `{ name }` |
| PUT | `/admin/categories/:id` | Rename a category |

#### Products
| Method | Path | Description |
|---|---|---|
| GET | `/admin/products` | List all products; supports `?search=` |
| GET | `/admin/products/:id` | Single product with populated category |
| POST | `/admin/products` | Create product; accepts `multipart/form-data` with `images[]` (max 10, 5 MB each); first image becomes cover |
| PUT | `/admin/products/:id` | Update product; new images are appended; `coverImagePublicId` body field changes the cover |

**Product form fields:** `title`, `description`, `category` (ObjectId), `brand`, `price`, `salePercentage`, `stock`, `status`, `colors[]`, `sizes[]`, `images[]` (files)

#### Orders
| Method | Path | Description |
|---|---|---|
| GET | `/admin/orders` | List all orders, newest first; returns `code` (last 8 chars of `_id`) |
| PATCH | `/admin/orders/:orderId/status` | Update `orderStatus`; on `"returned"` restores product stock; on `"delivered"` sets `deliveredAt` |

#### Settings (Banners)
| Method | Path | Description |
|---|---|---|
| GET | `/admin/settings/banners` | List all banners newest first |
| POST | `/admin/settings/banners` | Upload banner images to Cloudinary (folder: `ecommerce-monster-video/banners`); returns created records |

#### Dashboard
| Method | Path | Description |
|---|---|---|
| GET | `/admin/dashboard/lite` | Returns `{ totalProducts, totalCategories, totalSales, totalOrders, totalReturnedOrders }` |

`totalSales` is computed via `$group` aggregation over `paymentStatus: "paid"` orders.

---

### 5.3 Customer Routes — `/customer`

#### Home
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/customer/home` | None | Returns banners (max 6), categories, recent active products (max 4), active promos (max 4) |

Effective price for each product is computed server-side: `price - (price × salePercentage / 100)`.

#### Products
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/customer/products` | None | Product listing with filters |
| GET | `/customer/products/:id` | None | Product detail page data |

#### Addresses
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/customer/address` | `requireAuth` | List user's saved addresses |
| POST | `/customer/address` | `requireAuth` | Add address; if `isDefault: true`, clears other defaults |
| PUT | `/customer/address/:id` | `requireAuth` | Update address |
| DELETE | `/customer/address/:id` | `requireAuth` | Delete address |

#### Promo Validation
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/customer/promos/:code` | `requireAuth` | Validate promo code; returns `{ code, percentage, minimumOrderValue, endsAt }` or 404/400 |

#### Cart
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/customer/cart` | `requireAuth` | Fetch cart with populated product data |
| POST | `/customer/cart/items` | `requireAuth` | Add item; validates color/size against product; respects stock |
| PATCH | `/customer/cart/items/:productId/increase` | `requireAuth` | Increment qty by 1; enforces stock ceiling |
| PATCH | `/customer/cart/items/:productId/decrease` | `requireAuth` | Decrement qty by 1; removes item if qty reaches 0 |
| DELETE | `/customer/cart/items/:productId` | `requireAuth` | Remove specific variant from cart |
| POST | `/customer/cart/sync` | `requireAuth` | Merge local (guest) cart into server cart on login |

Cart items with `color` and/or `size` are treated as distinct line items. Query params `?color=&size=` are used to identify the variant on PATCH/DELETE.

#### Wishlist
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/customer/wishlist` | `requireAuth` | Fetch wishlist with product previews |
| POST | `/customer/wishlist/items` | `requireAuth` | Add product; idempotent (no duplicate) |
| DELETE | `/customer/wishlist/items/:productId` | `requireAuth` | Remove from wishlist |

#### Checkout — Razorpay Flow
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/customer/checkout/create-session` | `requireAuth` | Validate cart + promo → create Razorpay order → persist pending Order doc → return Razorpay credentials |
| POST | `/customer/checkout/confirm` | `requireAuth` | Verify HMAC signature → decrement stock → decrement promo count → clear cart → mark order `paid` |

**create-session body:** `{ addressId, promoCode? }`
**confirm body:** `{ orderId, razorpay_payment_id, razorpay_order_id, razorpay_signature }`

Payment verification uses HMAC-SHA256:
```
signature = HMAC(secret, razorpay_order_id + "|" + razorpay_payment_id)
```

#### Checkout — Loyalty Points Flow
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/customer/checkout/points` | `requireAuth` | Return user's current point balance |
| POST | `/customer/checkout/pay-with-points` | `requireAuth` | Pay entire order using points; 1 point = 1 INR; deducts atomically; rolls back on stock failure |

**pay-with-points body:** `{ addressId, promoCode? }`

Points are deducted atomically with `$gte` check. On any downstream failure (stock, etc.) points are refunded in the catch block.

#### Orders
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/customer/orders` | `requireAuth` | List authenticated user's orders, newest first |
| GET | `/customer/orders/:id` | `requireAuth` | Single order detail with populated product names |

---

## 6. Business Rules

### Pricing
- Effective price = `price - (price × salePercentage / 100)`, rounded to nearest integer.
- `salePercentage = 0` means no discount.

### Stock Management
- Stock is validated at checkout session creation (not at cart add, to avoid over-restricting browsing).
- Actual decrement happens only after payment signature is verified.
- On order `returned` by admin, stock is restored to all items.

### Promo Codes
- Must be active (`startsAt ≤ now ≤ endsAt`) and have `count ≥ 1`.
- Subtotal after item pricing must meet `minimumOrderValue`.
- `count` is decremented by 1 on successful payment confirmation.
- Promo is applied before points/Razorpay; discount reduces `totalAmount`.

### Loyalty Points
- Points are earned externally (not tracked by any current API endpoint — future feature).
- 1 point = 1 INR.
- Full order must be coverable by available points (no partial points payment).
- Points checkout bypasses Razorpay entirely; uses `points_<timestamp>` as order/payment ID.

### Image Upload
- Images are uploaded to Cloudinary from in-memory buffers (no disk writes).
- First image in the upload array is automatically marked as `isCover`.
- On product update, new images are appended to existing images; cover can be reassigned via `coverImagePublicId`.

---

## 7. Environment Variables

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Server port (default `5000`) |
| `MONGODB_URI` | Yes | MongoDB connection string |
| `CORS_ORIGINS` | Yes | Comma-separated allowed origins |
| `CLERK_SECRET_KEY` | Yes | Clerk backend secret |
| `CLERK_PUBLISHABLE_KEY` | Yes | Clerk publishable key |
| `ADMIN_EMAILS` | Yes | Comma-separated emails that receive admin role |
| `CLOUDINARY_CLOUD_NAME` | Yes | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Yes | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Yes | Cloudinary API secret |
| `RAZORPAY_KEY_ID` | Yes | Razorpay key ID (sent to client) |
| `RAZORPAY_KEY_SECRET` | Yes | Razorpay secret (server-side only) |

---

## 8. Error Handling

- `AppError(statusCode, message)` — operational errors thrown from route handlers.
- `asyncHandler(fn)` — wraps async route handlers; uncaught errors are forwarded to Express error middleware.
- Global `errorHandler` middleware serializes errors to the envelope format with appropriate HTTP status codes.
- Unmatched routes fall through to `notFound` middleware, returning `404`.

---

## 9. Non-Functional Requirements

| Concern | Approach |
|---|---|
| **Security** | Auth via Clerk JWTs; admin routes double-guarded at middleware and router level; Razorpay HMAC verification prevents forged payment confirmations |
| **Data Integrity** | Atomic stock decrements use `{ $gte: quantity }` filter — mismatched count signals race condition; points deduction uses same pattern |
| **Performance** | Lean queries (`.lean<T>()`) for read-heavy endpoints; parallel fetches via `Promise.all` on home and checkout endpoints; MongoDB indexes on hot query paths |
| **Scalability** | Stateless server — no session state; Clerk handles auth token validation |
| **Observability** | Morgan `dev` logging for all requests; startup and DB errors logged to stderr |

---

## 10. Out of Scope (Current Version)

- Email notifications on order status change
- Points earning mechanism (orders placed do not currently award points)
- Product reviews / ratings
- Multi-vendor support
- Inventory restock alerts
- Pagination on product and order list endpoints
- Soft-delete for products and categories
- Banner deletion endpoint
- Category deletion endpoint
