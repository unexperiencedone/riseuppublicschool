import dotenv from 'dotenv';
dotenv.config();

const bool = (v, d = false) => (v === undefined ? d : String(v).toLowerCase() === 'true');
const num = (v, d) => (v === undefined || v === '' ? d : Number(v));

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  isProd: (process.env.NODE_ENV || 'development') === 'production',
  port: num(process.env.PORT, 5000),
  apiPrefix: process.env.API_PREFIX || '/api/v1',

  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/riseup_school',

  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  adminUrl: process.env.ADMIN_URL || 'http://localhost:5173',

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'dev_access_secret_change_me',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'dev_refresh_secret_change_me',
    accessExpires: process.env.JWT_ACCESS_EXPIRES || '15m',
    refreshExpires: process.env.JWT_REFRESH_EXPIRES || '30d',
  },
  bcryptRounds: num(process.env.BCRYPT_ROUNDS, 10),

  seed: {
    email: process.env.SEED_ADMIN_EMAIL || 'riseuppublicschool48@gmail.com',
    password: process.env.SEED_ADMIN_PASSWORD || 'ChangeMe@123',
    name: process.env.SEED_ADMIN_NAME || 'School Administrator',
  },

  storage: {
    driver: process.env.STORAGE_DRIVER || 'local',
    dir: process.env.UPLOAD_DIR || 'uploads',
    maxMb: num(process.env.MAX_UPLOAD_MB, 8),
    cloudinary: {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      apiSecret: process.env.CLOUDINARY_API_SECRET,
      folder: process.env.CLOUDINARY_FOLDER || 'riseup-school',
    },
  },

  mail: {
    driver: process.env.MAIL_DRIVER || 'log',
    host: process.env.SMTP_HOST,
    port: num(process.env.SMTP_PORT, 587),
    secure: bool(process.env.SMTP_SECURE, false),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.MAIL_FROM || 'Rise UP Public School <no-reply@riseuppublicschool.in>',
    adminInbox: process.env.MAIL_ADMIN_INBOX || 'riseuppublicschool48@gmail.com',
  },

  sms: {
    driver: process.env.SMS_DRIVER || 'log',
    authKey: process.env.MSG91_AUTH_KEY,
    senderId: process.env.MSG91_SENDER_ID || 'RUPSCH',
    route: process.env.MSG91_ROUTE || '4',
    templates: {
      enquiry: process.env.MSG91_TEMPLATE_ENQUIRY,
      result: process.env.MSG91_TEMPLATE_RESULT,
      fee: process.env.MSG91_TEMPLATE_FEE,
    },
  },

  whatsapp: {
    driver: process.env.WHATSAPP_DRIVER || 'log',
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    token: process.env.WHATSAPP_TOKEN,
  },

  payments: {
    driver: process.env.PAYMENTS_DRIVER || 'mock',
    keyId: process.env.RAZORPAY_KEY_ID,
    keySecret: process.env.RAZORPAY_KEY_SECRET,
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,
  },

  rateLimit: {
    windowMin: num(process.env.RATE_LIMIT_WINDOW_MIN, 15),
    max: num(process.env.RATE_LIMIT_MAX, 300),
    publicFormMax: num(process.env.PUBLIC_FORM_LIMIT_MAX, 10),
  },

  // Shared rate-limit store for serverless deployments. Unset → falls back to
  // express-rate-limit's in-memory store (fine for `npm run dev`, meaningless
  // across independent Vercel lambdas). See middleware/rateLimiter.js.
  upstash: {
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  },
};

export default env;
