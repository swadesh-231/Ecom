# Deploying to Render

This app deploys as a **single Web Service**: the build compiles the React
frontend, and the Express backend serves it (so there's one server, one URL, and
one set of environment variables).

## How it fits together

| Command                | What it does                                                        |
| ---------------------- | ------------------------------------------------------------------- |
| `npm run install-all`  | Installs root + `Backend` + `Frontend` dependencies                 |
| `npm run dev`          | Runs backend (`:8000`) and frontend dev server (`:5173`) together   |
| `npm run build`        | Installs deps and builds the frontend into `Frontend/dist`          |
| `npm start`            | Starts the backend; in production it also serves `Frontend/dist`    |
| `npm run seed`         | Seeds the database                                                  |

All env vars live in a single **`.env` at the repo root** (`.env.example` is the
template). The backend loads it via `Backend/src/loadEnv.js`; Vite reads the
`VITE_*` vars from the same file via `envDir` in `vite.config.ts`.

## Local development

```bash
cp .env.example .env   # then fill in real values
npm run install-all
npm run dev
```

## Render setup

You can either use the committed `render.yaml` (Blueprint) or configure a Web
Service manually with these settings:

- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`
- **Health Check Path:** `/api/v1/health`

### Environment variables (Render dashboard → Environment)

Render does not use your local `.env`; add each variable in the dashboard:

| Variable                     | Value                                                        |
| ---------------------------- | ----------------------------------------------------------- |
| `NODE_ENV`                   | `production`  ← required so the backend serves the frontend |
| `CORS_ORIGIN`                | your Render URL, e.g. `https://your-app.onrender.com`       |
| `MONGO_URI`                  | your MongoDB connection string                              |
| `CLERK_PUBLISHABLE_KEY`      | from Clerk                                                  |
| `CLERK_SECRET_KEY`           | from Clerk                                                  |
| `CLOUDINARY_CLOUD_NAME`      | from Cloudinary                                             |
| `CLOUDINARY_API_KEY`         | from Cloudinary                                             |
| `CLOUDINARY_API_SECRET`      | from Cloudinary                                             |
| `STRIPE_SECRET_KEY`          | from Stripe                                                 |
| `STRIPE_WEBHOOK_SECRET`      | from the Stripe Dashboard webhook endpoint                 |
| `VITE_CLERK_PUBLISHABLE_KEY` | from Clerk (same as the publishable key)                   |
| `VITE_BACKEND_URL`           | **leave empty** — frontend and API share one origin         |

> `PORT` is provided automatically by Render — do not set it. The app reads
> `process.env.PORT`.

### Notes

- The Stripe webhook endpoint to register in Stripe is
  `https://your-app.onrender.com/api/v1/checkout/webhook`.
- After the first deploy, set `CORS_ORIGIN` to your actual Render URL (it's used
  for Stripe success/cancel redirects) and trigger a redeploy.
- `VITE_*` vars are baked in at **build time**, so changing them requires a
  rebuild/redeploy, not just a restart.
