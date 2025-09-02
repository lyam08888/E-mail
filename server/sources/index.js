const { fetchFromAdzuna } = require('./source-adzuna');
const { fetchSample } = require('./source-sample');

async function fetchAllJobs() {
  const results = [];
  try { results.push(...await fetchFromAdzuna()); } catch (e) { console.warn('[Adzuna] fallback', e.message); }
  try { results.push(...await fetchSample()); } catch {}

  // Deduplicate by sourceUrl/title/company
  const seen = new Set();
  const dedup = [];
  for (const j of results) {
    const key = (j.sourceUrl||'') + '|' + (j.title||'') + '|' + (j.company||'');
    if (!seen.has(key)) { seen.add(key); dedup.push(j); }
  }
  return dedup;
}

module.exports = { fetchAllJobs };
