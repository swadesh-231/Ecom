# Nestify — Full-Stack E-Commerce

A modern MERN e-commerce platform: **React + TypeScript + Vite** frontend and
**Express + MongoDB** backend, with **Clerk** authentication, **Cloudinary**
image uploads, and **Stripe** checkout.

## Features

- 🔐 **Auth** — Clerk (sign-in/up, sessions); backend mirrors users to MongoDB with roles
- 🛍️ **Storefront** — home, collections with search/filter/sort/pagination, product details
- ⭐ **Reviews** — per-product ratings & comments
- 🛒 **Cart** — client-side, persisted to localStorage
- 💳 **Checkout** — Stripe hosted checkout + webhook order confirmation
- 🖼️ **Image upload** — Multer (memory) → Cloudinary
- 🛠️ **Admin panel** — dashboard, product CRUD with image upload, order status management
- 🎨 **UI** — shadcn/ui + Tailwind v4, light/dark theme, toasts, skeletons

## Tech Stack

| Layer    | Tech                                                              |
| -------- | ---------------------------------------------------------------- |
| Frontend | React 19, TypeScript, Vite, React Router, Zustand, axios, sonner |
| Backend  | Express 5, Mongoose, Clerk, Cloudinary, Multer, Stripe           |
| Auth     | Clerk                                                            |

---

## Getting Started

### 1. Backend

```bash
cd Backend
npm install
```

Create `Backend/.env` (see `.env.example`):

```
PORT=8000
CORS_ORIGIN=http://localhost:5173
MONGO_URI=...
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

```bash
npm run seed     # optional: load sample products
npm run dev      # starts on http://localhost:8000
```

### 2. Frontend

```bash
cd Frontend
npm install
```

Create `Frontend/.env`:

```
VITE_BACKEND_URL=http://localhost:8000   # must match the backend's PORT
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
```

```bash
npm run dev      # starts on http://localhost:5173
```

### 3. Stripe webhook (local)

Card payments are confirmed via a webhook. With the [Stripe CLI](https://stripe.com/docs/stripe-cli):

```bash
stripe listen --forward-to localhost:8000/api/v1/checkout/webhook
```

Copy the printed `whsec_...` into `STRIPE_WEBHOOK_SECRET`. Use test card
`4242 4242 4242 4242` at checkout.

### 4. Make yourself an admin

Roles live in MongoDB. After signing in once (which creates your user), set your
`role` to `admin` on the `users` collection, then reload — the admin panel
appears at `/admin`.

---

## API Overview

| Method | Endpoint                          | Access | Description                  |
| ------ | --------------------------------- | ------ | ---------------------------- |
| POST   | `/api/v1/auth/sync`               | auth   | Upsert Clerk user, get role  |
| GET    | `/api/v1/products`                | public | List (search/filter/sort)    |
| GET    | `/api/v1/products/:id`            | public | Product detail               |
| POST   | `/api/v1/products`                | admin  | Create (multipart, images)   |
| PATCH  | `/api/v1/products/:id`            | admin  | Update                       |
| DELETE | `/api/v1/products/:id`            | admin  | Delete (+ Cloudinary cleanup)|
| POST   | `/api/v1/orders`                  | auth   | Place a Cash-on-Delivery order |
| GET    | `/api/v1/orders/mine`             | auth   | My orders                    |
| GET    | `/api/v1/orders`                  | admin  | All orders                   |
| PATCH  | `/api/v1/orders/:id/status`       | admin  | Update fulfillment status    |
| GET    | `/api/v1/reviews/:productId`      | public | Product reviews              |
| POST   | `/api/v1/reviews/:productId`      | auth   | Add/update review            |
| POST   | `/api/v1/checkout/create-session` | auth   | Start Stripe (card) checkout |
| POST   | `/api/v1/checkout/webhook`        | Stripe | Payment confirmation         |

All responses use a consistent envelope: `{ statusCode, data, message, success }`.
