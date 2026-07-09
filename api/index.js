require('dotenv').config();
const express = require('express');
const licenseRoutes = require('./routes/license');

const app = express();
app.use(express.json());

app.use('/license', licenseRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Lion License API listening on port ${PORT}`);
});
