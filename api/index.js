const express = require('express');
const handleWebhook = require('./routes/webhooks');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT || 8080);

const app = express();

// Parse JSON bodies
app.use((req, res, next) => {
  let data = '';
  req.setEncoding('utf8');
  req.on('data', chunk => data += chunk);
  req.on('end', () => {
    try {
      req.body = data ? JSON.parse(data) : {};
    } catch {
      req.body = {};
    }
    next();
  });
});

// Webhook endpoint
app.post('/webhooks/sellauth', handleWebhook);

// Debug: show licenses as JSON
app.get('/debug/licenses', (req, res) => {
  const DATA_DIR = path.resolve(__dirname, '../data');
  const LICENSES_PATH = path.join(DATA_DIR, 'licenses.json');
  console.log('[api debug] LICENSES_PATH:', LICENSES_PATH);

  try {
    if (!fs.existsSync(LICENSES_PATH)) {
      return res.json({ error: 'file_not_found', path: LICENSES_PATH });
    }
    const raw = fs.readFileSync(LICENSES_PATH, 'utf8');
    res.type('json').send(raw);
  } catch (e) {
    console.error('[api debug] error', e);
    res.status(500).json({ error: String(e) });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Lion License API listening on port ${PORT}`);
});
