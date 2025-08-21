// Standalone Express server for Chargebee plan lookup using the latest Chargebee Node SDK (ESM style)
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Chargebee from 'chargebee';

dotenv.config({ path: './apps/web/.env.local' });

const app = express();
app.use(cors());

const chargebee = new Chargebee({
  site: process.env.CHARGEBEE_SITE,
  apiKey: process.env.CHARGEBEE_API_KEY,
});

app.get('/get-plan', async (req, res) => {
  const { subscription_id } = req.query;
  if (!subscription_id || typeof subscription_id !== 'string') {
    console.error('Missing subscription_id');
    return res.status(400).json({ error: 'Missing subscription_id' });
  }
  try {
    const result = await chargebee.subscription.retrieve(subscription_id);
    console.log('Chargebee result:', result);
    // Extract plan_id from the first subscription item, if available
    const subscriptionItems = result.subscription.subscription_items;
    let plan_id = null;
    if (Array.isArray(subscriptionItems) && subscriptionItems.length > 0) {
      plan_id = subscriptionItems[0].item_price_id || null;
    }
    res.status(200).json({ plan: plan_id });
  } catch (error) {
    console.error('Chargebee error:', error);
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.CHARGEBEE_PLAN_PORT || 4001;
app.listen(PORT, () => {
  console.log(`Chargebee plan server running on port ${PORT}`);
});
