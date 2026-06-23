// Standardized application error. Thrown anywhere in the request lifecycle and
// converted into a JSON response by the global error handler.
class ApiError extends Error {
  constructor(statusCode, message = "Something went wrong", errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.errors = errors;
    this.success = false;
    this.data = null;

    Error.captureStackTrace(this, this.constructor);
  }
}

export { ApiError };
