import app from './app.js';
import env from './config/env.js';
import logger from './config/logger.js';
import { connectDB, disconnectDB } from './config/db.js';

let server;

async function bootstrap() {
  await connectDB();
  server = app.listen(env.port, () => {
    logger.info(`API listening on http://localhost:${env.port}${env.apiPrefix}  [${env.nodeEnv}]`);
  });
}

const shutdown = (signal) => async () => {
  logger.warn(`${signal} received — shutting down gracefully`);
  server?.close(async () => {
    await disconnectDB();
    process.exit(0);
  });
  setTimeout(() => process.exit(1), 10000).unref();
};

process.on('SIGTERM', shutdown('SIGTERM'));
process.on('SIGINT', shutdown('SIGINT'));
process.on('unhandledRejection', (reason) => {
  logger.error(`Unhandled rejection: ${reason}`);
});
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught exception: ${err.message}`, { stack: err.stack });
  process.exit(1);
});

bootstrap().catch((err) => {
  logger.error(`Startup failed: ${err.message}`);
  process.exit(1);
});
