import { ApiError } from "../utils/ApiError.js";

/**
 * Global error handler. Converts thrown errors (including our ApiError,
 * Mongoose validation/duplicate-key errors, and Clerk auth errors) into a
 * consistent JSON response.
 */
// eslint-disable-next-line no-unused-vars -- Express needs the 4-arg signature
export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let errors = err.errors || [];

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    statusCode = 400;
    errors = Object.values(err.errors).map((e) => e.message);
    message = "Validation failed";
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = `Duplicate value for "${field}"`;
  }

  // Clerk throws when no/invalid session is present on a protected route.
  if (err.clerkError || err.name === "UnauthorizedError") {
    statusCode = 401;
    message = "Unauthorized — please sign in";
  }

  if (statusCode >= 500) {
    console.error("[ERROR]", err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors,
    data: null,
  });
};

/** 404 handler for unmatched routes. */
export const notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`));
};
