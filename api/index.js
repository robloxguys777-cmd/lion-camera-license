const express = require('express');
const handleWebhook = require('./routes/webhooks');

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

// Health check
app.get('/health', (req, res) => {
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log(`Lion License API listening on port ${PORT}`);
});
