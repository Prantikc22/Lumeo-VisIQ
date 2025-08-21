# VisitorIQ Chargebee Metered Billing Integration

This guide documents how to integrate Chargebee metered billing (per plan) with your app using Supabase for usage tracking and Node.js for usage reporting.

## Plan & Addon Mapping

| Plan ID               | Overage Addon ID   | API Call Cap | Price (USD) |
|-----------------------|--------------------|--------------|-------------|
| Free-USD-Monthly      | Overage-Free       | 2,000        | $0          |
| Starter-USD-Monthly   | API-Call-Overage   | 25,000       | $29         |
| Growth-USD-Monthly    | OverageGrowth      | 150,000      | $99         |
| Business-USD-Monthly  | Overage-Business   | 500,000      | $299        |
| Scale-USD-Monthly     | Overage-Scale      | 1,000,000+   | $699        |

- Each overage addon is metered: 1 unit = 1,000 API calls (set in Chargebee tiers)

## Usage Reporting Utility

- Located at: `scripts/report_usage_chargebee.js`
- Usage: Reports API call usage for a subscription and plan to Chargebee (using correct overage addon)
- Example usage:

```js
const { reportUsage } = require('./report_usage_chargebee');
// Report 3500 API calls for a Starter-USD-Monthly subscription
reportUsage('SUBSCRIPTION_ID', 'Starter-USD-Monthly', 3500)
  .then(console.log)
  .catch(console.error);
```

- Update `CHARGEBEE_SITE` and `CHARGEBEE_API_KEY` for production.

## Integration Steps

1. **Track API Calls per User**
   - Store API call counts in Supabase per user/subscription per billing period.

2. **Report Usage to Chargebee**
   - On billing cycle end (or daily), call `reportUsage(subscriptionId, planId, apiCalls)` for each active subscription.
   - The utility will map the plan to the correct overage addon and push usage (in 1,000s) to Chargebee.

3. **Switching to Production**
   - Update the Chargebee API key and site URL in `report_usage_chargebee.js`.

## Notes
- Each plan/addon is mapped 1:1 (no generic overage addon).
- All integration is currently set up for the Chargebee test environment.
- You can automate usage reporting with a scheduled job (e.g., daily/cron job) that queries Supabase and calls the utility for each subscription.

---

For further customization or automation, update the utility or reach out for more advanced integration (webhooks, real-time reporting, etc.).
