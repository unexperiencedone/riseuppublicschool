import mongoose from 'mongoose';
import ApiError from '../utils/ApiError.js';
import logger from '../config/logger.js';
import env from '../config/env.js';

export const notFound = (req, _res, next) =>
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found`));

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, _next) => {
  let error = err;

  if (err instanceof mongoose.Error.ValidationError) {
    error = ApiError.unprocessable('Validation failed',
      Object.values(err.errors).map((e) => ({ path: e.path, message: e.message })));
  } else if (err instanceof mongoose.Error.CastError) {
    error = ApiError.badRequest(`Invalid value for '${err.path}'`);
  } else if (err?.code === 11000) {
    error = ApiError.conflict(`Duplicate value for: ${Object.keys(err.keyValue || {}).join(', ')}`);
  } else if (err?.type === 'entity.too.large') {
    error = ApiError.badRequest('Payload too large');
  } else if (!(err instanceof ApiError)) {
    error = new ApiError(err.statusCode || 500, err.message || 'Something went wrong', { isOperational: false });
  }

  if (error.statusCode >= 500) {
    logger.error(`${req.method} ${req.originalUrl} → ${error.message}`, { stack: err.stack });
  } else {
    logger.warn(`${req.method} ${req.originalUrl} → ${error.statusCode} ${error.message}`);
  }

  return res.status(error.statusCode).json({
    success: false,
    message: error.message,
    code: error.code,
    ...(error.details ? { errors: error.details } : {}),
    ...(env.isProd ? {} : { stack: err.stack }),
  });
};
