let client = null;
if (process.env.OPENAI_API_KEY) {
  try {
    const OpenAI = require('openai');
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  } catch (e) {
    // If the library is not loadable (ESM/CommonJS mismatch), skip AI and fallback to heuristic
    client = null;
  }
}

const MUST_HAVE = [
  'VRD',
  'hydraulique',
  'CVC',
  'bâtiment',
  'batiment',
  'ingénieur',
  'ingenieur',
  'France'
];

function basicHeuristicFilter(jobs) {
  const textHasKeywords = (text) => {
    const lower = (text || '').toLowerCase();
    return MUST_HAVE.some(k => lower.includes(k.toLowerCase()));
  };

  return jobs.filter(j => textHasKeywords(j.title) || textHasKeywords(j.description) || textHasKeywords(j.tags?.join(' ')));
}

async function aiFilterJobs(jobs) {
  // If no API key, fallback to a heuristic keyword filter
  if (!client) {
    return basicHeuristicFilter(jobs);
  }

  // Summarize and filter in batches to save tokens
  const batches = [];
  const size = 20;
  for (let i = 0; i < jobs.length; i += size) {
    batches.push(jobs.slice(i, i + size));
  }

  const results = [];
  for (const batch of batches) {
    const prompt = `Tu es un assistant de recrutement pour l'ingénierie du bâtiment en France (VRD, hydraulique, CVC).\n\nConsigne:\n- Sélectionne uniquement les offres pertinentes pour ces domaines en France.\n- Retourne une liste d'index (0-based) des offres pertinentes dans ce lot.\n\nLot d'offres (JSON):\n${JSON.stringify(batch.map(j => ({
      title: j.title,
      company: j.company,
      location: j.location,
      description: (j.description || '').slice(0, 1200),
    })), null, 2)}\n\nRépond UNIQUEMENT avec un JSON de la forme {"indexes":[0,2,5]} sans texte autour.`;

    try {
      const resp = await client.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'Tu aides à filtrer des offres pour VRD/Hydraulique/CVC en France.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0
      });

      const text = resp.choices?.[0]?.message?.content?.trim() || '{}';
      let idx = [];
      try { idx = JSON.parse(text).indexes || []; } catch {}
      idx.forEach(i => { if (batch[i]) results.push(batch[i]); });
    } catch (e) {
      // On any AI error, fallback to heuristic for this batch
      results.push(...basicHeuristicFilter(batch));
    }
  }

  return results;
}

module.exports = { aiFilterJobs };
