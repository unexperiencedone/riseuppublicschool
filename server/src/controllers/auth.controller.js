import crypto from 'node:crypto';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { ok, created } from '../utils/ApiResponse.js';
import User from '../models/User.js';
import env from '../config/env.js';
import sendEmail from '../services/email.service.js';
import recordAudit from '../middleware/audit.js';
import {
  signAccessToken, signRefreshToken, verifyRefreshToken, refreshCookieOptions,
} from '../utils/token.js';

const issueTokens = async (user, res) => {
  const payload = { sub: String(user._id), role: user.role, name: user.name };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken({ sub: String(user._id) });

  await User.updateOne(
    { _id: user._id },
    { $push: { refreshTokens: { $each: [{ token: refreshToken }], $slice: -5 } }, $set: { lastLoginAt: new Date() } }
  );
  res.cookie('refreshToken', refreshToken, refreshCookieOptions());
  return { accessToken, refreshToken };
};

/** POST /auth/register — staff accounts are created by admins, not self-service. */
export const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password, role } = req.body;
  if (await User.exists({ email })) throw ApiError.conflict('An account with this email already exists');

  const user = await User.create({ name, email, phone, password, role: role || 'parent' });
  await recordAudit(req, { action: 'user.register', entity: 'User', entityId: user._id, after: { email, role: user.role } });
  const tokens = await issueTokens(user, res);
  return created(res, { user: user.toSafeJSON(), ...tokens }, 'Account created');
});

/** POST /auth/login */
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) throw ApiError.unauthorized('Invalid email or password');
  if (!user.isActive) throw ApiError.forbidden('This account has been deactivated. Contact the school office.');

  const tokens = await issueTokens(user, res);
  return ok(res, { user: user.toSafeJSON(), ...tokens }, 'Signed in');
});

/** POST /auth/refresh — rotates the refresh token. */
export const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  if (!token) throw ApiError.unauthorized('Missing refresh token');

  let payload;
  try { payload = verifyRefreshToken(token); } catch { throw ApiError.unauthorized('Invalid or expired refresh token'); }

  const user = await User.findById(payload.sub).select('+refreshTokens');
  if (!user || !user.refreshTokens.some((t) => t.token === token)) {
    // Token reuse → revoke everything (defence against stolen tokens)
    if (user) await User.updateOne({ _id: user._id }, { $set: { refreshTokens: [] } });
    throw ApiError.unauthorized('Refresh token has been revoked');
  }

  await User.updateOne({ _id: user._id }, { $pull: { refreshTokens: { token } } });
  const tokens = await issueTokens(user, res);
  return ok(res, { user: user.toSafeJSON(), ...tokens }, 'Token refreshed');
});

/** POST /auth/logout */
export const logout = asyncHandler(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  if (token) {
    try {
      const payload = verifyRefreshToken(token);
      await User.updateOne({ _id: payload.sub }, { $pull: { refreshTokens: { token } } });
    } catch { /* already invalid */ }
  }
  res.clearCookie('refreshToken', { ...refreshCookieOptions(), maxAge: undefined });
  return ok(res, null, 'Signed out');
});

/** GET /auth/me */
export const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('student wards', 'firstName lastName admissionNo classLevel section');
  return ok(res, { user: { ...user.toSafeJSON(), studentDoc: user.student, wardDocs: user.wards } });
});

/** PATCH /auth/change-password */
export const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.comparePassword(req.body.currentPassword))) throw ApiError.badRequest('Current password is incorrect');
  user.password = req.body.newPassword;
  user.mustChangePassword = false;
  user.refreshTokens = [];
  await user.save();
  return ok(res, null, 'Password changed. Please sign in again on other devices.');
});

/** POST /auth/forgot-password */
export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  // Always 200 — never reveal whether an email exists.
  if (user) {
    const raw = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(raw).digest('hex');
    user.passwordResetExpires = new Date(Date.now() + 30 * 60 * 1000);
    await user.save({ validateBeforeSave: false });
    await sendEmail({
      to: user.email,
      subject: 'Reset your Rise UP Public School password',
      template: 'password-reset',
      data: { resetUrl: `${env.clientUrl}/reset-password?token=${raw}` },
    });
  }
  return ok(res, null, 'If that email is registered, a reset link has been sent.');
});

/** POST /auth/reset-password */
export const resetPassword = asyncHandler(async (req, res) => {
  const hashed = crypto.createHash('sha256').update(req.body.token).digest('hex');
  const user = await User.findOne({ passwordResetToken: hashed, passwordResetExpires: { $gt: new Date() } })
    .select('+passwordResetToken +passwordResetExpires');
  if (!user) throw ApiError.badRequest('This reset link is invalid or has expired');

  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  user.refreshTokens = [];
  await user.save();
  return ok(res, null, 'Password reset. You can now sign in.');
});
