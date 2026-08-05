import ApiError from '../utils/ApiError.js';

/**
 * validate({ body: zodSchema, query: zodSchema, params: zodSchema })
 * Replaces req.<part> with the parsed (coerced + stripped) value.
 */
const validate = (schemas) => (req, _res, next) => {
  const issues = [];
  for (const part of ['body', 'query', 'params']) {
    const schema = schemas[part];
    if (!schema) continue;
    const result = schema.safeParse(req[part]);
    if (!result.success) {
      issues.push(...result.error.issues.map((i) => ({ in: part, path: i.path.join('.'), message: i.message })));
    } else if (part === 'query') {
      // Express 5 makes req.query read-only — stash parsed value instead
      req.validatedQuery = result.data;
    } else {
      req[part] = result.data;
    }
  }
  if (issues.length) return next(ApiError.unprocessable('Validation failed', issues));
  return next();
};

export default validate;
