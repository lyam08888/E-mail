const fetch = require('node-fetch');

// Adzuna provides a jobs API. You need to set ADZUNA_APP_ID and ADZUNA_APP_KEY in .env to enable this source.
// Free tier may be limited; consult their terms before use. This is a convenience connector.

async function fetchFromAdzuna() {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  if (!appId || !appKey) return [];

  const what = encodeURIComponent('VRD OR hydraulique OR CVC OR "ingénieur bâtiment"');
  const where = encodeURIComponent('France');
  const url = `https://api.adzuna.com/v1/api/jobs/fr/search/1?app_id=${appId}&app_key=${appKey}&results_per_page=50&what=${what}&where=${where}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Adzuna HTTP ' + res.status);
  const data = await res.json();

  return (data.results || []).map(r => ({
    source: 'adzuna',
    sourceUrl: r.redirect_url,
    title: r.title,
    company: r.company?.display_name,
    location: [r.location?.area?.join(', ')].filter(Boolean).join(', '),
    postedAt: r.created,
    contract: r.contract_time || r.contract_type,
    seniority: '',
    description: r.description,
    tags: r.category ? [r.category.label] : []
  }));
}

module.exports = { fetchFromAdzuna };
