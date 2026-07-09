const https = require('https');
const fs = require('fs');
const path = require('path');

const SELLAUTH_API_KEY = process.env.SELLAUTH_API_KEY || '';
const SELLAUTH_SHOP_ID = Number(process.env.SELLAUTH_SHOP_ID || 0);

const BASE = 'https://api.sellauth.com/api';

async function fetchSellAuth(pathname) {
  return new Promise((resolve, reject) => {
    const req = https.get(`${BASE}${pathname}`, {
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
  console.log('[webhook] headers:', JSON.stringify(req.headers));
  console.log('[webhook] body:', JSON.stringify(req.body));

  res.status(200).json({ ok: true });

  try {
    const payload = req.body || {};
    const event = payload.event;
    const invoiceId = payload.invoice_id || payload.id;
    const customer = payload.customer || null;
    const customerId = payload.shop_customer_id || customer?.id || null;
    const discordId = customer?.discord_id || null;

    console.log('[webhook] event:', event, 'invoiceId:', invoiceId, 'customerId:', customerId);

    if (!invoiceId) {
      console.warn('[webhook] no invoice id');
      return;
    }

    let finalDiscordId = discordId;

    if (!finalDiscordId && customerId) {
      const invoice = await fetchSellAuth(`/shops/${SELLAUTH_SHOP_ID}/invoices/${invoiceId}`);
      finalDiscordId = invoice?.customer?.discord_id || invoice?.customer?.discord_id || null;
    }

    if (!finalDiscordId) {
      console.warn('[webhook] no discord_id found');
      return;
    }

    const licensesPath = path.resolve(__dirname, '../data/licenses.json');
    const licenses = JSON.parse(fs.readFileSync(licensesPath, 'utf8'));

    const newKey = 'LION-' + Math.random().toString(36).slice(2, 10).toUpperCase();

    licenses.push({
      key: newKey,
      discord_id: finalDiscordId,
      created_at: new Date().toISOString(),
      used_by: null,
    });

    fs.writeFileSync(licensesPath, JSON.stringify(licenses, null, 2));

    console.log('[webhook] created license for', finalDiscordId, newKey);
  } catch (e) {
    console.error('[webhook] error', e);
  }
}

module.exports = handleWebhook;
