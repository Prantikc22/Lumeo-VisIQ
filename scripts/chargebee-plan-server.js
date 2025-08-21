// Standalone Express server for Chargebee plan lookup
const express = require('express');
const cors = require('cors');
require('dotenv').config({ path: './apps/web/.env.local' });

const app = express();
app.use(cors());

const chargebee = require('chargebee').configure({
  site: process.env.CHARGEBEE_SITE,
  api_key: process.env.CHARGEBEE_API_KEY,
});

app.get('/get-plan', (req, res) => {
  const { subscription_id } = req.query;
  if (!subscription_id) {
    return res.status(400).json({ error: 'Missing subscription_id' });
  }
  chargebee.subscription.retrieve(subscription_id).request(function (error, result) {
    if (error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(200).json({ plan: result.subscription.plan_id });
    }
  });
});

const PORT = process.env.CHARGEBEE_PLAN_PORT || 4001;
app.listen(PORT, () => {
  console.log(`Chargebee plan server running on port ${PORT}`);
});
