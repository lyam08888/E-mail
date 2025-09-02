let client = null;
let geminiModel = null;

// Initialiser OpenAI si disponible
if (process.env.OPENAI_API_KEY) {
  try {
    const OpenAI = require('openai');
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  } catch (e) {
    // Si la bibliothèque n'est pas chargeable, ignorer et passer au fallback
    client = null;
  }
}

// Initialiser Gemini si disponible
if (process.env.GEMINI_API_KEY) {
  try {
    const { GoogleGenerativeAI } = require('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    geminiModel = genAI.getGenerativeModel({ 
      model: process.env.GEMINI_MODEL || 'gemini-1.5-flash' 
    });
  } catch (e) {
    // Si la bibliothèque n'est pas chargeable, ignorer
    geminiModel = null;
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
  // Si aucune API IA n'est configurée, utiliser le filtrage heuristique
  if (!client && !geminiModel) {
    return basicHeuristicFilter(jobs);
  }

  // Traiter en lots pour économiser les tokens
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
      let response;
      
      // Essayer Gemini en premier (souvent gratuit)
      if (geminiModel) {
        try {
          const result = await geminiModel.generateContent(prompt);
          response = result.response.text();
        } catch (geminiError) {
          console.warn('[Gemini] Error, trying OpenAI fallback:', geminiError.message);
          response = null;
        }
      }
      
      // Fallback vers OpenAI si Gemini échoue ou n'est pas disponible
      if (!response && client) {
        try {
          const resp = await client.chat.completions.create({
            model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
            messages: [
              { role: 'system', content: 'Tu aides à filtrer des offres pour VRD/Hydraulique/CVC en France.' },
              { role: 'user', content: prompt }
            ],
            temperature: 0
          });
          response = resp.choices?.[0]?.message?.content?.trim() || '{}';
        } catch (openaiError) {
          console.warn('[OpenAI] Error:', openaiError.message);
          response = null;
        }
      }

      // Parser la réponse IA
      if (response) {
        let idx = [];
        try { 
          idx = JSON.parse(response.trim()).indexes || []; 
        } catch (parseError) {
          console.warn('[AI] JSON parse error, using heuristic for this batch');
        }
        idx.forEach(i => { if (batch[i]) results.push(batch[i]); });
      } else {
        // Si toutes les IA échouent, utiliser le filtrage heuristique pour ce lot
        results.push(...basicHeuristicFilter(batch));
      }
    } catch (e) {
      // En cas d'erreur générale, utiliser le filtrage heuristique
      console.warn('[AI] General error, using heuristic:', e.message);
      results.push(...basicHeuristicFilter(batch));
    }
  }

  return results;
}

module.exports = { aiFilterJobs };
