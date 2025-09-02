async function fetchSample() {
  // Fallback static sample if APIs are not configured yet
  return [
    {
      source: 'sample',
      sourceUrl: 'https://example.com/jobs/ingenieur-vrd-paris',
      title: 'Ingénieur VRD - Projets urbains',
      company: 'Bureau Etudes X',
      location: 'Paris, Île-de-France',
      postedAt: new Date().toISOString(),
      contract: 'CDI',
      seniority: '3-5 ans',
      description: 'Conception VRD, assainissement, réseaux humides/secs. Coordination intervenants. Outils: AutoCAD/Covadis.',
      tags: ['VRD', 'Assainissement', 'AutoCAD']
    },
    {
      source: 'sample',
      sourceUrl: 'https://example.com/jobs/ingenieur-hydraulique-lyon',
      title: 'Ingénieur Hydraulique urbaine',
      company: 'Hydro Conseil',
      location: 'Lyon, Auvergne-Rhône-Alpes',
      postedAt: new Date().toISOString(),
      contract: 'CDI',
      seniority: '2-4 ans',
      description: 'Modélisation réseaux d\'eau potable et eaux usées, EPANET, SWMM, SIG. Dimensionnement ouvrages.',
      tags: ['Hydraulique', 'EPANET', 'SIG']
    },
    {
      source: 'sample',
      sourceUrl: 'https://example.com/jobs/ingenieur-cvc-marseille',
      title: 'Ingénieur CVC - Tertiaire',
      company: 'ThermoBat',
      location: 'Marseille, Provence-Alpes-Côte d\'Azur',
      postedAt: new Date().toISOString(),
      contract: 'CDI',
      seniority: 'Senior',
      description: 'Conception HVAC/CVC, bilans thermiques, dimensionnement CTA, HVAC BIM Revit.',
      tags: ['CVC', 'HVAC', 'Revit']
    }
  ];
}

module.exports = { fetchSample };
