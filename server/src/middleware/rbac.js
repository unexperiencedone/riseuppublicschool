import ApiError from '../utils/ApiError.js';

/** requireRole('admin','principal') */
export const requireRole = (...roles) => (req, _res, next) => {
  if (!req.user) return next(ApiError.unauthorized());
  if (!roles.flat().includes(req.user.role)) {
    return next(ApiError.forbidden(`Requires one of: ${roles.flat().join(', ')}`));
  }
  return next();
};

/** Parents may only read their own wards; students only themselves. */
export const requireOwnStudent = (paramKey = 'studentId') => (req, _res, next) => {
  const { user } = req;
  if (!user) return next(ApiError.unauthorized());
  if (['super_admin', 'admin', 'principal', 'teacher', 'accountant'].includes(user.role)) return next();

  const target = String(req.params[paramKey] || req.query[paramKey] || '');
  if (user.role === 'student' && String(user.student) === target) return next();
  if (user.role === 'parent' && (user.wards || []).map(String).includes(target)) return next();
  return next(ApiError.forbidden('You can only access your own records'));
};
