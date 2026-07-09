const fs = require('fs');
const path = require('path');

const DATA_DIR = path.resolve(__dirname, '../data');
const LICENSES_PATH = path.join(DATA_DIR, 'licenses.json');

console.log('[webhook] DATA_DIR:', DATA_DIR);
console.log('[webhook] LICENSES_PATH:', LICENSES_PATH);

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
  console.log('[webhook] body event:', req.body?.event);

  // Respond immediately so SellAuth doesn't retry
  res.status(200).json({ ok: true });

  try {
    const payload = req.body || {};

    // SellAuth sends: payload.customer.discord_id
    const discordId = payload.customer?.discord_id;
    const invoiceId = payload.invoice_id || payload.id;

    console.log('[webhook] event:', payload.event);
    console.log('[webhook] invoiceId:', invoiceId);
    console.log('[webhook] discordId:', discordId);

    if (!discordId) {
      console.warn('[webhook] no discord_id in payload.customer');
      return;
    }

    const licenses = loadLicenses();

    const newKey = 'LION-' + Math.random().toString(36).slice(2, 10).toUpperCase();

    licenses.push({
      key: newKey,
      discord_id: discordId,        // string, e.g. "1345628709532733537"
      created_at: new Date().toISOString(),
      used_by: null,
      invoice_id: invoiceId || null,
      source: 'sellauth-webhook',
    });

    saveLicenses(licenses);

    console.log('[webhook] created license for', discordId, newKey);
    console.log('[webhook] total licenses now:', licenses.length);
  } catch (e) {
    console.error('[webhook] error', e);
  }
}

module.exports = handleWebhook;
