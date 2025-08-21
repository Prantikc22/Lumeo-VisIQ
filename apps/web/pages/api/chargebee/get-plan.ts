import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { subscription_id } = req.query;
  if (!subscription_id || typeof subscription_id !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid subscription_id' });
  }

  let chargebeeLib = require('chargebee');
  if (chargebeeLib.default) {
    chargebeeLib = chargebeeLib.default;
  }
  const chargebee = chargebeeLib.configure({
    site: process.env.CHARGEBEE_SITE,
    api_key: process.env.CHARGEBEE_API_KEY,
  });

  chargebee.subscription.retrieve(subscription_id).request(function(error: any, result: any) {
    if (error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(200).json({ plan: result.subscription.plan_id });
    }
  });
}