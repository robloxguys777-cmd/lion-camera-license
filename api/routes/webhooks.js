const fs = require('fs');
const path = require('path');

async function handleWebhook(req, res) {
  console.log('[webhook] headers:', JSON.stringify(req.headers));
  console.log('[webhook] body:', JSON.stringify(req.body));

  res.status(200).json({ ok: true });

  try {
    const payload = req.body || {};
    const event = payload.event;
    const invoiceId = payload.invoice_id || payload.id;
    const customer = payload.customer || {};
    const discordId = customer.discord_id;

    console.log('[webhook] event:', event, 'invoiceId:', invoiceId, 'discordId:', discordId);

    if (!discordId) {
      console.warn('[webhook] no discord_id found');
      return;
    }

    const licensesPath = path.resolve(__dirname, '../data/licenses.json');
    const licenses = JSON.parse(fs.readFileSync(licensesPath, 'utf8'));

    const newKey = 'LION-' + Math.random().toString(36).slice(2, 10).toUpperCase();

   licenses.push({
  key: newKey,
  discord_id: discordId,        // string, e.g. "1345628709532733537"
  created_at: new Date().toISOString(),
  used_by: null,
  invoice_id: invoiceId || null
});

    fs.writeFileSync(licensesPath, JSON.stringify(licenses, null, 2));

    console.log('[webhook] created license for', discordId, newKey);
  } catch (e) {
    console.error('[webhook] error', e);
  }
}

module.exports = handleWebhook;
