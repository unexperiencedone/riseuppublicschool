export default class ApiError extends Error {
  constructor(statusCode, message, { code = undefined, details = undefined, isOperational = true } = {}) {
    super(message);
    this.statusCode = statusCode;
    this.code = code || httpCode(statusCode);
    this.details = details;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
  static badRequest(m = 'Bad request', d) { return new ApiError(400, m, { details: d }); }
  static unauthorized(m = 'Authentication required') { return new ApiError(401, m); }
  static forbidden(m = 'You do not have permission to perform this action') { return new ApiError(403, m); }
  static notFound(m = 'Resource not found') { return new ApiError(404, m); }
  static conflict(m = 'Resource already exists') { return new ApiError(409, m); }
  static unprocessable(m = 'Validation failed', d) { return new ApiError(422, m, { details: d }); }
  static tooMany(m = 'Too many requests') { return new ApiError(429, m); }
  static internal(m = 'Something went wrong') { return new ApiError(500, m, { isOperational: false }); }
}

function httpCode(status) {
  return ({
    400: 'BAD_REQUEST', 401: 'UNAUTHENTICATED', 403: 'FORBIDDEN', 404: 'NOT_FOUND',
    409: 'CONFLICT', 422: 'VALIDATION_ERROR', 429: 'RATE_LIMITED', 500: 'INTERNAL_ERROR',
  })[status] || 'ERROR';
}
