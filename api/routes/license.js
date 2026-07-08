const express = require('express');
const router = express.Router();

// POST /license/create
router.post('/create', async (req, res) => {
  const { discordId, productId } = req.body;

  // TODO:
  // - Validate input
  // - Check auth/permissions
  // - Generate a real license key
  // - Store it in your database

  // For now, just mock a response.
  res.json({
    success: true,
    licenseKey: 'MOCK-KEY-1234',
    discordId,
    productId
  });
});

// GET /license/by-discord/:discordId
router.get('/by-discord/:discordId', async (req, res) => {
  const { discordId } = req.params;

  // TODO:
  // - Look up license in DB for this discordId
  // - Return the key if active

  // For now, just mock a response.
  res.json({
    success: false,
    message: 'No active license found for this Discord ID.'
  });
});

module.exports = router;
