const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();
const dataFile = path.join(__dirname, '../data/licenses.json');

function readLicenses() {
  try {
    const raw = fs.readFileSync(dataFile, 'utf8');
    return JSON.parse(raw || '[]');
  } catch {
    return [];
  }
}

function writeLicenses(licenses) {
  fs.writeFileSync(dataFile, JSON.stringify(licenses, null, 2), 'utf8');
}

function makeKey() {
  return 'LCM-' + Math.random().toString(36).slice(2, 8).toUpperCase() + '-' + Math.random().toString(36).slice(2, 8).toUpperCase();
}

router.post('/create', async (req, res) => {
  const { discordId, productId } = req.body;

  if (!discordId || !productId) {
    return res.status(400).json({ success: false, message: 'discordId and productId are required.' });
  }

  const licenses = readLicenses();
  const existing = licenses.find(l => l.discordId === discordId && l.productId === productId && l.status === 'active');
  if (existing) {
    return res.json({ success: true, licenseKey: existing.licenseKey, discordId, productId, reused: true });
  }

  const licenseKey = makeKey();
  licenses.push({
    licenseKey,
    discordId,
    productId,
    status: 'active',
    createdAt: new Date().toISOString()
  });

  writeLicenses(licenses);

  res.json({
    success: true,
    licenseKey,
    discordId,
    productId,
    reused: false
  });
});

router.get('/by-discord/:discordId', async (req, res) => {
  const { discordId } = req.params;
  const licenses = readLicenses();
  const license = licenses.find(l => l.discordId === discordId && l.status === 'active');

  if (!license) {
    return res.json({
      success: false,
      message: 'No active license found for this Discord ID.'
    });
  }

  res.json({
    success: true,
    licenseKey: license.licenseKey,
    discordId: license.discordId,
    productId: license.productId,
    status: license.status
  });
});

module.exports = router;
