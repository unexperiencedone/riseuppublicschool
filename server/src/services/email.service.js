import nodemailer from 'nodemailer';
import env from '../config/env.js';
import logger from '../config/logger.js';
import { renderTemplate } from '../templates/index.js';

let transporter = null;
function getTransporter() {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: env.mail.host,
    port: env.mail.port,
    secure: env.mail.secure,
    auth: env.mail.user ? { user: env.mail.user, pass: env.mail.pass } : undefined,
  });
  return transporter;
}

/**
 * sendEmail({ to, subject, template, data })  or  ({ to, subject, html })
 * driver=log prints to console — safe default so dev never leaks real mail.
 */
export async function sendEmail({ to, subject, template, data = {}, html, cc, bcc, attachments }) {
  const body = html || renderTemplate(template, data);

  if (env.mail.driver !== 'smtp') {
    logger.info(`[MAIL:log] → ${to} | ${subject}`);
    logger.debug(body.slice(0, 400));
    return { queued: true, driver: 'log' };
  }

  try {
    const info = await getTransporter().sendMail({
      from: env.mail.from, to, cc, bcc, subject, html: body, attachments,
    });
    logger.info(`[MAIL:smtp] sent ${info.messageId} → ${to}`);
    return { queued: true, driver: 'smtp', messageId: info.messageId };
  } catch (err) {
    logger.error(`[MAIL:smtp] failed → ${to}: ${err.message}`);
    return { queued: false, error: err.message };   // never break the request
  }
}

export default sendEmail;
