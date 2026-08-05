import env from '../config/env.js';
import logger from '../config/logger.js';

/** Meta WhatsApp Cloud API — template messages only for business-initiated sends. */
export async function sendWhatsApp({ to, template, languageCode = 'en', components = [], text }) {
  const mobile = String(to).replace(/\D/g, '').slice(-10);

  if (env.whatsapp.driver !== 'meta') {
    logger.info(`[WA:log] → ${mobile} | ${template || text}`);
    return { sent: true, driver: 'log' };
  }

  const payload = template
    ? { messaging_product: 'whatsapp', to: `91${mobile}`, type: 'template',
        template: { name: template, language: { code: languageCode }, components } }
    : { messaging_product: 'whatsapp', to: `91${mobile}`, type: 'text', text: { body: text } };

  try {
    const res = await fetch(`https://graph.facebook.com/v20.0/${env.whatsapp.phoneNumberId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.whatsapp.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    return { sent: res.ok, driver: 'meta', response: json };
  } catch (err) {
    logger.error(`[WA:meta] failed → ${mobile}: ${err.message}`);
    return { sent: false, error: err.message };
  }
}

export default sendWhatsApp;
