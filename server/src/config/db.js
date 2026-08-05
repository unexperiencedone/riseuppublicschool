import mongoose from 'mongoose';
import env from './env.js';
import logger from './logger.js';

mongoose.set('strictQuery', true);

/**
 * Cached on globalThis (not a module-level variable) because Vercel can keep a
 * module instance alive across invocations on the same warm lambda but may also
 * reload the module graph between them; globalThis is the one thing guaranteed
 * to survive a warm start either way. Without this, every cold start opens a
 * fresh connection pool, and Atlas M0's connection cap (500) is exhausted fast
 * under concurrent invocations.
 */
const cache = globalThis.__mongooseCache || (globalThis.__mongooseCache = { conn: null, promise: null });

export async function connectDB(uri = env.mongoUri) {
  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    cache.promise = mongoose
      .connect(uri, {
        serverSelectionTimeoutMS: 10000,
        maxPoolSize: 5,
      })
      .then((conn) => {
        logger.info(`MongoDB connected → ${conn.connection.host}/${conn.connection.name}`);
        return conn;
      })
      .catch((err) => {
        cache.promise = null; // let the next invocation retry instead of caching a rejection forever
        logger.error(`MongoDB connection failed: ${err.message}`);
        throw err;
      });
  }

  cache.conn = await cache.promise;
  return cache.conn;
}

export async function disconnectDB() {
  await mongoose.connection.close();
  cache.conn = null;
  cache.promise = null;
  logger.info('MongoDB disconnected');
}

export default connectDB;
