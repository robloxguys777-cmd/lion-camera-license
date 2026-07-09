require('dotenv').config();
const express = require('express');
const licenseRoutes = require('./routes/license');
const handleWebhook = require('./routes/webhooks');

const app = express();
app.use(express.json());

app.use('/license', licenseRoutes);
app.post('/webhooks/sellauth', handleWebhook);

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Lion License API listening on port ${PORT}`);
});
