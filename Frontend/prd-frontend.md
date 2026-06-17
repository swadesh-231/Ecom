# Frontend PRD — MERN E-Commerce Platform

## 1. Overview

This document defines the product requirements for the frontend of a full-stack MERN e-commerce application. The client is a single-page React application targeting two distinct user personas: **Customers** (shoppers) and **Admins** (store managers).

**Tech Stack**
| Layer | Technology |
|---|---|
| Framework | React 19 |
| Language | TypeScript (`~5.9`) |
| Build Tool | Vite 8 |
| Routing | React Router DOM v7 (browser router) |
| State Management | Zustand v5 |
| UI Components | shadcn/ui (Radix UI primitives) |
| Styling | Tailwind CSS v4 |
| HTTP Client | Axios |
| Auth | Clerk (`@clerk/react`) |
| Notifications | Sonner (toast) |
| Drawer | Vaul |
| Theming | next-themes |
| Icons | Lucide React |
| Typography | Inter Variable (`@fontsource-variable/inter`) |

---

## 2. Architecture

```
client/
├── src/
│   ├── main.tsx                  # App root — ClerkProvider, RouterProvider, ThemeProvider
│   ├── App.tsx                   # Global providers wrapper
│   ├── router.tsx                # Route tree definition
│   ├── lib/
│   │   ├── api.ts                # Axios instance (base URL from env)
│   │   ├── types.ts              # Shared types: AppUser, ApiEnvelope, ApiErrorItem
│   │   ├── utils.ts              # cn() class utility
│   │   └── env.ts                # Typed env var access
│   ├── features/
│   │   ├── auth/                 # Auth bootstrap, store, types, API
│   │   ├── admin/
│   │   │   ├── dashboard/        # Stats fetch, store, types
│   │   │   ├── products/         # CRUD hooks, form hook, API, constants, types
│   │   │   ├── orders/           # Order list fetch, store, types
│   │   │   ├── promo/            # Promo CRUD hook, API, types
│   │   │   └── settings/         # Banner management, API, types
│   │   └── customer/
│   │       ├── home/             # Home data fetch, store, types
│   │       ├── products/         # Collection listing, detail store, API, types
│   │       ├── cart-and-checkout/ # Cart + checkout flow, store, API, types
│   │       ├── wishlist/         # Wishlist store, API, types
│   │       ├── orders/           # Customer orders store, API, types
│   │       └── profile/          # Address management store, API, types
│   ├── pages/
│   │   ├── auth/                 # Sign-in, Sign-up (Clerk hosted components)
│   │   ├── admin/                # Dashboard, Products, Promos, Orders, Settings
│   │   └── customer/             # Home, Collections, Collection-Details, Order-Success
│   └── components/
│       ├── ui/                   # shadcn/ui primitives (skeleton, etc.)
│       ├── auth/                 # PublicOnlyLayout, ProtectedLayout, RoleGuardLayout
│       ├── layout/               # CustomerLayout, AdminLayout
│       ├── common/               # Loader
│       ├── admin/
│       │   ├── common/           # Sidebar
│       │   ├── products/         # Table, dialog, image-picker, color-picker, size-selector, toolbar
│       │   ├── promos/           # Table, dialog, toolbar
│       │   └── settings/         # Banner table
│       └── customer/
│           ├── common/           # Desktop navbar, mobile navbar
│           ├── products/         # Product card, filters panel, detail components
│           ├── cart-and-checkout/ # Cart drawer, cart items
│           ├── wishlist/         # Wishlist dialog
│           ├── orders/           # Orders dialog
│           └── profile/          # Profile dialog
```

---

## 3. Routing

### Route Tree

```
/                          → CustomerLayout
  (index)                  → StoreHome
  PublicOnlyLayout
    sign-in/*              → SignInPage
    sign-up/*              → SignUpPage
    collections            → Collections
    collection/:id         → CollectionDetails
  ProtectedLayout
    order-success          → CustomerOrderSuccessPage

ProtectedLayout
  RoleGuardLayout (allow: admin)
    /admin                 → AdminLayout
      (index)              → AdminDashboard
      products             → AdminProducts
      coupons              → AdminCoupons
      orders               → AdminOrders
      settings             → AdminSettings
```

### Guard Layouts

| Component | Behavior |
|---|---|
| `PublicOnlyLayout` | Redirects authenticated users away (e.g. from sign-in page) |
| `ProtectedLayout` | Redirects unauthenticated users to sign-in |
| `RoleGuardLayout` | Accepts an `allow` prop (array of roles); redirects if user's role is not included |

---

## 4. Authentication

Authentication is fully delegated to **Clerk**.

### Bootstrap Flow (`useBootstrapAuth`)
1. Clerk session is loaded.
2. On session presence, call `POST /auth/sync` to upsert the user in MongoDB and receive role assignment.
3. Store `AppUser` (`id`, `clerkUserId`, `email`, `name`, `role`) in Zustand auth store.
4. Role determines which routes and UI elements are accessible.

### Auth Store (`features/auth/store.ts`)
- State: `user: AppUser | null`, `isLoading: boolean`
- Actions: `setUser`, `clearUser`

### Types
```ts
type UserRole = "user" | "admin";
type AppUser = {
  id: string;
  clerkUserId: string;
  email?: string;
  name?: string;
  role: UserRole;
};
```

---

## 5. Customer-Facing Features

### 5.1 Home Page (`/`)

**Data fetched from:** `GET /customer/home`

**Sections displayed:**
- **Hero Banner Carousel** — up to 6 Cloudinary-hosted banner images
- **Categories Strip** — all available product categories as navigation shortcuts
- **New Arrivals Grid** — 4 most recently added active products with cover image, brand, title, original price, effective sale price, and sale badge
- **Active Coupons Strip** — up to 4 currently active promo codes showing code, discount %, minimum order value, and expiry

**State:** Home store (`features/customer/home/store.ts`) with `banners`, `categories`, `recentProducts`, `coupons`.

---

### 5.2 Collections Page (`/collections`)

**Data fetched from:** `GET /customer/products` with filter params

**Features:**
- Product grid with `CustomerProductCard` components
- Filters panel (`customer-filters-panel.tsx`) — filter by category, size, color, price range
- Shared filter/listing logic via `use-customer-collections.ts` and `product-list.shared.ts`

**Product card displays:** cover image, title, brand, effective price, sale badge if `salePercentage > 0`.

---

### 5.3 Product Detail Page (`/collection/:id`)

**Data fetched from:** `GET /customer/products/:id`

**Components:**
- `customer-product-details-gallery.tsx` — image gallery; cover image prominent, thumbnails for others
- `customer-product-details-summary.tsx` — title, brand, price, sale price, description, add-to-cart / add-to-wishlist CTAs
- `customer-product-options-group.tsx` — color swatch picker and size selector; required variants enforced before add-to-cart
- `customer-related-product-card.tsx` — related products section

**State:** Product detail store (`features/customer/products/details/store.ts`)

---

### 5.4 Cart

**Trigger:** Cart icon in navbar shows total item count badge.

**UI:** Vaul drawer (`customer-cart-and-checkout-drawer.tsx`) slides in from right.

**Features:**
- Line items grouped by product + color + size variant
- Increase / decrease quantity buttons (stock-bounded)
- Remove item
- Cart total computed client-side from `finalPrice × quantity`
- Promo code input field — validated via `GET /customer/promos/:code`; discount shown inline
- Address selector (from saved addresses)
- "Pay with Razorpay" CTA → starts checkout session
- "Pay with Points" CTA (if user has enough points) → points checkout

**State:** Cart store (`features/customer/cart-and-checkout/store.ts`) — `items`, `totalQuantity`, `promoCode`, `discountAmount`.

**Guest cart:** Items added before login are stored locally. On login, `POST /customer/cart/sync` merges them into the server cart.

---

### 5.5 Checkout Flow

#### Razorpay Flow
1. User selects address + optional promo code in cart drawer.
2. `POST /customer/checkout/create-session` → returns Razorpay `keyId`, `orderId`, `amount`, `currency`.
3. Razorpay SDK (`razorpay.d.ts`) opens payment modal.
4. On success, Razorpay calls handler with `{ razorpay_payment_id, razorpay_order_id, razorpay_signature }`.
5. `POST /customer/checkout/confirm` verifies and confirms; server clears cart.
6. Redirect to `/order-success`.

#### Points Flow
1. User clicks "Pay with Points" (shown only if `points ≥ totalAmount`).
2. `POST /customer/checkout/pay-with-points` — server deducts points atomically.
3. Redirect to `/order-success`.

#### Order Success Page (`/order-success`)
- Confirms the order was placed.
- Shows order summary (order ID, amount paid, item count).
- Link back to shopping.

---

### 5.6 Wishlist

**Trigger:** Heart icon on product cards and detail page.

**UI:** Dialog (`customer-wishlist-dialog.tsx`) showing saved products with preview images and quick-add-to-cart.

**State:** Wishlist store (`features/customer/wishlist/store.ts`) — `items[]`.

---

### 5.7 Orders

**Trigger:** "My Orders" in navbar or profile area.

**UI:** Dialog (`customer-orders-dialog.tsx`) listing all past orders — order code, status badge, date, total amount.

**State:** Orders store (`features/customer/orders/store.ts`).

---

### 5.8 Profile & Addresses

**Trigger:** Avatar / user menu in navbar.

**UI:** Dialog (`customer-profile-dialog.tsx`) — shows name, email, and address book.

**Address book features:**
- View all saved addresses
- Add new address (fullName, address line, state, postalCode, isDefault toggle)
- Edit existing address
- Delete address
- Set default address

**State:** Profile store (`features/customer/profile/store.ts`).

---

### 5.9 Navigation

**Desktop (`desktop-navbar.tsx`):**
- Logo / home link
- Collections link
- Cart icon with item count badge
- Wishlist icon
- User menu (sign in, sign up, profile, orders, sign out)
- Theme toggle

**Mobile (`mobile-navbar.tsx`):**
- Hamburger menu
- Same links in collapsible panel
- Cart and wishlist icon buttons

---

## 6. Admin Panel Features

All admin routes are under `/admin` and require `role: "admin"`.

**Layout (`AdminLayout`):** Persistent sidebar (`sidebar.tsx`) with navigation links; main content area.

### 6.1 Dashboard (`/admin`)

**Data:** `GET /admin/dashboard/lite`

**Stats cards displayed:**
- Total Products
- Total Categories
- Total Sales (INR)
- Total Orders
- Total Returned Orders

**State:** Dashboard store (`features/admin/dashboard/store.ts`).

---

### 6.2 Products (`/admin/products`)

**Components:**
- `products-toolbar.tsx` — search input, "Add Product" button, "Add Category" button
- `products-table.tsx` — sortable table with columns: cover image, title, category, brand, price, sale %, stock, status, actions
- `product-dialog.tsx` — create/edit product form (drawer or modal)
- `category-dialog.tsx` — create/edit category form
- `image-picker.tsx` — drag-and-drop or file picker; shows existing images with cover selector; supports multiple file upload
- `color-picker.tsx` — color hex input with swatch preview; multi-color support
- `size-selector.tsx` — checkbox group for S / M / L / XL

**Hooks:**
- `use-admin-products.ts` — list, create, update product; integrates with Zustand store
- `use-product-form.ts` — form state, validation, submit handler
- `constants.ts` — size options, default form values

**State:** Products store via `features/admin/products/`.

---

### 6.3 Promos / Coupons (`/admin/coupons`)

**Components:**
- `promo-toolbar.tsx` — search + "Add Promo" button
- `promos-table.tsx` — table with code, discount %, min order value, uses remaining, start/end dates, status badge, actions
- `promo-dialog.tsx` — create/edit form

**Fields:** code (auto-uppercased), percentage, count, minimumOrderValue, startsAt, endsAt.

**Hook:** `use-admin-promo.ts` — list, create, update promos.

---

### 6.4 Orders (`/admin/orders`)

**Data:** `GET /admin/orders`

**Table columns:** Order code, customer name, email, total items, amount, payment status badge, order status badge, paid at, created at, actions.

**Inline order status update:** Dropdown select → `PATCH /admin/orders/:orderId/status`. Status transitions: `placed → shipped → delivered → returned`.

**State:** Admin orders store (`features/admin/orders/store.ts`).

---

### 6.5 Settings — Banner Management (`/admin/settings`)

**Data:** `GET /admin/settings/banners`

**Component:** `admin-settings-banner-table.tsx`

**Features:**
- View all uploaded banners (thumbnail, upload date)
- Upload new banner images (multi-file, drag-and-drop)
- Images sent to `POST /admin/settings/banners` as `multipart/form-data`

---

## 7. State Management

Zustand is used for all global client state. Each feature domain has its own store file.

| Store | Domain | Key State |
|---|---|---|
| `auth/store` | Auth | `user`, `isLoading` |
| `customer/home/store` | Home data | `banners`, `categories`, `recentProducts`, `coupons` |
| `customer/cart-and-checkout/store` | Cart | `items`, `totalQuantity`, promo state |
| `customer/wishlist/store` | Wishlist | `items` |
| `customer/orders/store` | Customer orders | `orders` |
| `customer/profile/store` | Profile/addresses | `addresses` |
| `customer/products/details/store` | Product detail | `product`, `selectedColor`, `selectedSize` |
| `admin/dashboard/store` | Dashboard stats | `stats` |
| `admin/orders/store` | Admin orders | `orders` |

Stores do not use persistence middleware — data is re-fetched on mount or when stale.

---

## 8. API Layer

**Axios instance (`lib/api.ts`):**
- `baseURL` from `VITE_API_URL` env var
- `withCredentials: true` for Clerk cookie auth
- Clerk session token injected into `Authorization: Bearer <token>` header via request interceptor

**Response type:**
```ts
type ApiEnvelope<T> = {
  status: "success" | "error";
  data: T | null;
  errors?: { message: string; code?: string }[];
};
```

Each feature's `api.ts` file exports typed async functions (e.g. `fetchHomeData()`, `addToCart(payload)`) that unwrap the envelope and throw on error status.

---

## 9. Environment Variables

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend base URL (e.g. `http://localhost:5000`) |
| `VITE_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `VITE_RAZORPAY_KEY_ID` | Razorpay key ID (also returned from server, but available client-side as fallback) |

---

## 10. Theming

- `next-themes` wraps the app with `ThemeProvider`.
- Light / dark mode toggled via a theme toggle button in the navbar.
- Tailwind CSS v4 with CSS variable-based color tokens — shadcn/ui components respect the active theme automatically.

---

## 11. Pages & Components Summary

### Customer Pages
| Route | Page Component | Key Child Components |
|---|---|---|
| `/` | `StoreHome` | Banner carousel, category strip, new arrivals grid, coupons strip |
| `/sign-in/*` | `SignInPage` | Clerk `<SignIn />` |
| `/sign-up/*` | `SignUpPage` | Clerk `<SignUp />` |
| `/collections` | `Collections` | `CustomerFiltersPanel`, `CustomerProductCard` grid |
| `/collection/:id` | `CollectionDetails` | Gallery, summary, options group, related products |
| `/order-success` | `CustomerOrderSuccessPage` | Success message, order summary |

### Admin Pages
| Route | Page Component | Key Child Components |
|---|---|---|
| `/admin` | `AdminDashboard` | Stats cards |
| `/admin/products` | `AdminProducts` | `ProductsToolbar`, `ProductsTable`, `ProductDialog`, `CategoryDialog` |
| `/admin/coupons` | `AdminCoupons` | `PromoToolbar`, `PromosTable`, `PromoDialog` |
| `/admin/orders` | `AdminOrders` | Orders table with inline status update |
| `/admin/settings` | `AdminSettings` | `AdminSettingsBannerTable` |

---

## 12. Non-Functional Requirements

| Concern | Approach |
|---|---|
| **Type Safety** | Strict TypeScript throughout; API responses typed with `ApiEnvelope<T>` generics |
| **Performance** | Vite code-splitting per route; lazy image loading with Cloudinary URLs; `Promise.all` for parallel home data fetch |
| **Accessibility** | Radix UI primitives are ARIA-compliant; keyboard navigation supported in dialogs, drawers, dropdowns |
| **Mobile Responsiveness** | Tailwind responsive utilities; separate mobile navbar component; Vaul drawer optimized for touch |
| **Security** | Clerk handles token lifecycle; no credentials stored in localStorage; Razorpay SDK handles PCI-sensitive data |
| **Error UX** | Sonner toasts for API errors and success confirmations; loading skeletons during data fetch |
| **DX** | ESLint with react-hooks and react-refresh plugins; TypeScript strict mode; Vite HMR |

---

## 13. Out of Scope (Current Version)

- Product search from the customer-facing navbar
- Pagination on the collections page
- Product reviews and star ratings
- Real-time order tracking / push notifications
- Social login beyond what Clerk provides by default
- Internationalization (i18n) / multi-currency
- SEO / SSR (client-side only SPA)
- Dark mode persistence across sessions (theme resets on reload)
- Customer points history / transaction log
- Admin user management (promote/demote roles from UI)
