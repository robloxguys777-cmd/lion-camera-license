const fs = require('fs');
const path = require('path');

const DATA_DIR = path.resolve(__dirname, '../data');
const LICENSES_PATH = path.join(DATA_DIR, 'licenses.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadLicenses() {
  ensureDataDir();
  if (!fs.existsSync(LICENSES_PATH)) {
    fs.writeFileSync(LICENSES_PATH, '[]', 'utf8');
    return [];
  }
  const raw = fs.readFileSync(LICENSES_PATH, 'utf8');
  return JSON.parse(raw);
}

function saveLicenses(licenses) {
  ensureDataDir();
  fs.writeFileSync(LICENSES_PATH, JSON.stringify(licenses, null, 2), 'utf8');
}

async function handleWebhook(req, res) {
  console.log('[webhook] headers:', JSON.stringify(req.headers));
  console.log('[webhook] body:', JSON.stringify(req.body));

  // Always respond quickly so SellAuth doesn't retry
  res.status(200).json({ ok: true });

  try {
    const payload = req.body || {};
    const event = payload.event;
    const invoiceId = payload.invoice_id || payload.id;
    const customer = payload.customer || {};
    const discordId = customer.discord_id;

    console.log('[webhook] event:', event, 'invoiceId:', invoiceId, 'discordId:', discordId);

    if (!discordId) {
      console.warn('[webhook] no discord_id found in payload');
      return;
    }

    const licenses = loadLicenses();

    const newKey = 'LION-' + Math.random().toString(36).slice(2, 10).toUpperCase();

    licenses.push({
      key: newKey,
      discord_id: discordId,
      created_at: new Date().toISOString(),
      used_by: null,
      invoice_id: invoiceId || null,
      source: 'sellauth-webhook',
    });

    saveLicenses(licenses);

    console.log('[webhook] created license for', discordId, newKey);
  } catch (e) {
    console.error('[webhook] error', e);
  }
}

module.exports = handleWebhook;
