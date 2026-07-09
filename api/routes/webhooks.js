const fs = require('fs');
const path = require('path');

// Force absolute path on Railway
const DATA_DIR = '/app/data';
const LICENSES_PATH = '/app/data/licenses.json';

console.log('[webhook] DATA_DIR:', DATA_DIR);
console.log('[webhook] LICENSES_PATH:', LICENSES_PATH);

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    console.log('[webhook] created data dir:', DATA_DIR);
  }
}

function loadLicenses() {
  ensureDataDir();
  if (!fs.existsSync(LICENSES_PATH)) {
    fs.writeFileSync(LICENSES_PATH, '[]', 'utf8');
    console.log('[webhook] created empty licenses file:', LICENSES_PATH);
    return [];
  }
  const raw = fs.readFileSync(LICENSES_PATH, 'utf8');
  return JSON.parse(raw);
}

function saveLicenses(licenses) {
  ensureDataDir();
  const json = JSON.stringify(licenses, null, 2);
  fs.writeFileSync(LICENSES_PATH, json, 'utf8');
  console.log('[webhook] saved licenses to:', LICENSES_PATH);
  console.log('[webhook] licenses content:', json);
}

async function handleWebhook(req, res) {
  console.log('[webhook] headers:', JSON.stringify(req.headers));
  console.log('[webhook] body event:', req.body?.event);

  res.status(200).json({ ok: true });

  try {
    const payload = req.body || {};

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
      discord_id: discordId,
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
