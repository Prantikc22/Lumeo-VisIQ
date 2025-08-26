// Utility for fetching Chargebee plans and addons by product family via API
// This can be run as a Node.js script with your API key and site URL

const axios = require('axios');

const CHARGEBEE_SITE = 'logicwerk';
const CHARGEBEE_API_KEY = 'live_wxSd5njglleKsn79wkS9E1wcu9acuJ6XYy';
const PRODUCT_FAMILY_NAME = 'VisitorIQ Plans';

async function getProductFamilyId() {
  const url = `https://${CHARGEBEE_SITE}.chargebee.com/api/v2/item_families?limit=100`;
  const { data } = await axios.get(url, {
    auth: { username: CHARGEBEE_API_KEY, password: '' },
  });
  if (!data.item_families || !Array.isArray(data.item_families)) {
    throw new Error('item_families missing in API response');
  }
  const family = data.item_families.find(fam => fam.item_family && fam.item_family.name === PRODUCT_FAMILY_NAME);
  if (!family) throw new Error('Product family not found');
  return family.item_family.id;
}

async function getPlansAndAddons(familyId) {
  const url = `https://${CHARGEBEE_SITE}.chargebee.com/api/v2/items?item_family_id[is]=${familyId}&limit=100`;
  const { data } = await axios.get(url, {
    auth: { username: CHARGEBEE_API_KEY, password: '' },
  });
  return data.items.map(i => i.item);
}

async function getAllItems() {
  const url = `https://${CHARGEBEE_SITE}.chargebee.com/api/v2/items?limit=100`;
  const { data } = await axios.get(url, {
    auth: { username: CHARGEBEE_API_KEY, password: '' },
  });
  if (!data.items || !Array.isArray(data.items)) {
    throw new Error('items missing in API response');
  }
  return data.items.map(i => i.item);
}

(async () => {
  try {
    const items = await getAllItems();
    console.log('All Chargebee Items (Plans & Addons):');
    items.forEach(item => {
      console.log(`ID: ${item.id}, Name: ${item.name}, Type: ${item.type}, Product Family: ${item.item_family_id}`);
    });
  } catch (e) {
    console.error(e);
  }
})();
