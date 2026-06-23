import axios from "axios";

// Single axios instance for the whole app. Base URL comes from the env var and
// every request is prefixed with the API version.
const api = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL}/api/v1`,
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
