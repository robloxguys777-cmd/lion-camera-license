require('dotenv').config();
const express = require('express');
const licenseRoutes = require('./routes/license');

const app = express();
app.use(express.json());

// Mount license routes under /license
app.use('/license', licenseRoutes);

const PORT = process.env.API_PORT || 3000;
app.listen(PORT, () => {
  console.log(`Lion License API listening on port ${PORT}`);
});
