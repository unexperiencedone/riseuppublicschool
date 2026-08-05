/* Minimal dependency-free structured logger. Swap for winston/pino in production. */
const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };
const active = LEVELS[process.env.LOG_LEVEL] ?? (process.env.NODE_ENV === 'production' ? 2 : 3);

const stamp = () => new Date().toISOString();
const write = (level, msg, meta) => {
  if (LEVELS[level] > active) return;
  const line = `[${stamp()}] ${level.toUpperCase().padEnd(5)} ${msg}`;
  const fn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
  meta ? fn(line, meta) : fn(line);
};

const logger = {
  error: (m, meta) => write('error', m, meta),
  warn: (m, meta) => write('warn', m, meta),
  info: (m, meta) => write('info', m, meta),
  debug: (m, meta) => write('debug', m, meta),
};
export default logger;
