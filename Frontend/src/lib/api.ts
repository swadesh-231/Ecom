import axios from "axios";

// Resolve the API base URL. In the single-service production deploy the frontend
// and API share an origin, so a relative "/api/v1" is correct. VITE_BACKEND_URL
// is only used when it points somewhere actually reachable from the current
// page: a stale "http://localhost:8000" baked into a production build (served
// over https on a real domain) is ignored so we fall back to the same origin.
// This keeps local dev working (page on :5173 → API on :8000) without letting a
// misconfigured build-time env var silently break production.
const resolveBaseUrl = () => {
  const configured = import.meta.env.VITE_BACKEND_URL?.trim();
  if (configured) {
    const isLocalhostBackend = /\/\/(localhost|127\.0\.0\.1)/.test(configured);
    const pageOnLocalhost =
      typeof window !== "undefined" &&
      /^(localhost|127\.0\.0\.1)$/.test(window.location.hostname);
    if (!isLocalhostBackend || pageOnLocalhost) {
      return `${configured.replace(/\/$/, "")}/api/v1`;
    }
  }
  return "/api/v1";
};

// Single axios instance for the whole app.
const api = axios.create({
  baseURL: resolveBaseUrl(),
  withCredentials: true,
});

// The Clerk session token is only retrievable from inside React (useAuth), so a
// component registers a getter here and the request interceptor uses it to
// attach the Authorization header that the backend's Clerk middleware reads.
let tokenGetter: (() => Promise<string | null>) | null = null;

export const setAuthTokenGetter = (
  fn: (() => Promise<string | null>) | null,
) => {
  tokenGetter = fn;
};

api.interceptors.request.use(async (config) => {
  if (tokenGetter) {
    const token = await tokenGetter();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Normalize backend error messages so callers can surface them in toasts.
export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    return (
      error.response?.data?.message ||
      error.message ||
      "Something went wrong"
    );
  }
  return "Something went wrong";
};

export default api;
