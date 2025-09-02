async function fetchJobs(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`/api/jobs${qs ? `?${qs}` : ''}`);
  const data = await res.json();
  return data.items || [];
}

function renderJobs(list) {
  const el = document.getElementById('jobs');
  const status = document.getElementById('status');
  if (!list.length) {
    el.innerHTML = '';
    status.textContent = 'Aucune offre trouvée.';
    return;
  }
  status.textContent = `${list.length} offre(s) trouvée(s)`;
  el.innerHTML = list.map(j => `
    <li class="job">
      <h3>${j.title || 'Sans titre'}</h3>
      <div class="meta">${j.company || 'Entreprise N/C'} — ${j.location || 'Lieu N/C'}</div>
      ${j.postedAt ? `<div class="meta">Publié: ${new Date(j.postedAt).toLocaleDateString('fr-FR')}</div>` : ''}
      <div class="desc">${(j.description||'').slice(0, 200)}${(j.description||'').length>200?'…':''}</div>
      <div class="tags">${(j.tags||[]).slice(0,5).map(t => `<span class="tag">${t}</span>`).join('')}</div>
      ${j.sourceUrl ? `<a href="${j.sourceUrl}" target="_blank" rel="noopener">Voir l'offre</a>` : ''}
    </li>
  `).join('');
}

async function refreshJobs() {
  const status = document.getElementById('status');
  status.textContent = 'Mise à jour en cours…';
  try {
    const res = await fetch('/api/jobs/update', { method: 'POST' });
    const data = await res.json();
    status.textContent = `Mise à jour: ${data.updated ?? 0} offres.`;
    await loadJobsFromQuery();
  } catch (e) {
    status.textContent = 'Erreur de mise à jour.';
  }
}

async function loadJobsFromQuery() {
  const q = document.getElementById('q').value.trim();
  const location = document.getElementById('location').value.trim();
  const seniority = document.getElementById('seniority').value.trim();
  const items = await fetchJobs({ q, location, seniority });
  renderJobs(items);
}

window.addEventListener('DOMContentLoaded', async () => {
  document.getElementById('searchForm').addEventListener('submit', (e) => {
    e.preventDefault();
    loadJobsFromQuery();
  });
  document.getElementById('refresh').addEventListener('click', refreshJobs);

  // First load
  document.getElementById('status').textContent = 'Chargement des offres…';
  const items = await fetchJobs();
  renderJobs(items);
});
