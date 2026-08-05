import env from '../config/env.js';
import logger from '../config/logger.js';

/**
 * MSG91 transactional SMS (India, DLT-registered templates required).
 * driver=log prints to console.
 */
export async function sendSMS({ to, message, templateId, variables = {} }) {
  const mobile = String(to).replace(/\D/g, '').slice(-10);
  if (mobile.length !== 10) return { sent: false, error: 'Invalid mobile number' };

  if (env.sms.driver !== 'msg91') {
    logger.info(`[SMS:log] → ${mobile} | ${message || templateId}`);
    return { sent: true, driver: 'log' };
  }

  try {
    const res = await fetch('https://control.msg91.com/api/v5/flow/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', authkey: env.sms.authKey },
      body: JSON.stringify({
        template_id: templateId,
        sender: env.sms.senderId,
        short_url: '0',
        recipients: [{ mobiles: `91${mobile}`, ...variables }],
      }),
    });
    const json = await res.json();
    logger.info(`[SMS:msg91] → ${mobile}`, json);
    return { sent: res.ok, driver: 'msg91', response: json };
  } catch (err) {
    logger.error(`[SMS:msg91] failed → ${mobile}: ${err.message}`);
    return { sent: false, error: err.message };
  }
}

export default sendSMS;
