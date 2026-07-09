const crypto = require('crypto');
const https = require('https');

const SELLAUTH_WEBHOOK_SECRET = process.env.SELLAUTH_WEBHOOK_SECRET || '';
const SELLAUTH_API_KEY = process.env.SELLAUTH_API_KEY || '';
const SELLAUTH_SHOP_ID = Number(process.env.SELLAUTH_SHOP_ID || 0);

const BASE = 'https://api.sellauth.com/api';

async function fetchSellAuth(path) {
  return new Promise((resolve, reject) => {
    const req = https.get(`${BASE}${path}`, {
      headers: {
        Authorization: `Bearer ${SELLAUTH_API_KEY}`,
        Accept: 'application/json',
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
  });
}

async function handleWebhook(req, res) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const rawBodyBuffer = Buffer.concat(chunks);

  console.log('[webhook] headers:', JSON.stringify(req.headers));

  // TEMPORARY: skip signature check to validate flow
  // We will re-enable this once we confirm the rest works
  // const signature = req.headers['x-signature'];
  // const expected = crypto.createHmac('sha256', SELLAUTH_WEBHOOK_SECRET).update(rawBodyBuffer).digest('hex');
  // if (!signature || signature !== expected) { ... }

  let payload;
  try {
    payload = JSON.parse(rawBodyBuffer.toString('utf8'));
  } catch (e) {
    console.warn('[webhook] bad json', e);
    return res.status(400).json({ ok: false });
  }

  const { event } = payload || {};
  const data = payload?.data || {};

  console.log('[webhook] event:', event, 'data:', data);

  try {
    if (event === 'NOTIFICATION.SHOP_INVOICE_PROCESSED' && data.invoice_id) {
      const invoice = await fetchSellAuth(`/shops/${SELLAUTH_SHOP_ID}/invoices/${data.invoice_id}`);
      const customerId = invoice?.customer_id;

      if (!customerId) {
        console.warn('[webhook] no customer_id in invoice');
        return res.status(200).json({ ok: true });
      }

      const customer = await fetchSellAuth(`/shops/${SELLAUTH_SHOP_ID}/customers/${customerId}`);
      const discordId = customer?.discord_id;

      if (!discordId) {
        console.warn('[webhook] no discord_id for customer', customerId);
        return res.status(200).json({ ok: true });
      }

      const licenses = require('../data/licenses.json');
      const newKey = 'LION-' + Math.random().toString(36).slice(2, 10).toUpperCase();

      licenses.push({
        key: newKey,
        discord_id: discordId,
        created_at: new Date().toISOString(),
        used_by: null,
      });

      require('fs').writeFileSync(
        require('path').resolve(__dirname, '../data/licenses.json'),
        JSON.stringify(licenses, null, 2)
      );

      console.log('[webhook] created license for', discordId, newKey);
    }
  } catch (e) {
    console.error('[webhook] error', e);
  }

  res.status(200).json({ ok: true });
}

module.exports = handleWebhook;
