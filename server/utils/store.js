// Very simple in-memory store; can be replaced by a DB later
const state = {
  jobs: []
};

function normalize(job) {
  return {
    id: job.id || `${(job.source||'src')}-${Buffer.from((job.title||'') + (job.company||'') + (job.location||'')).toString('base64')}`,
    source: job.source || 'unknown',
    sourceUrl: job.sourceUrl || job.url || '',
    title: job.title || '',
    company: job.company || '',
    location: job.location || '',
    postedAt: job.postedAt || null,
    contract: job.contract || '',
    seniority: job.seniority || '',
    description: job.description || '',
    tags: job.tags || []
  };
}

exports.memoryStore = {
  getJobs() { return state.jobs; },
  setJobs(jobs) { state.jobs = jobs.map(normalize); },
  addJobs(jobs) { state.jobs = [...state.jobs, ...jobs.map(normalize)]; }
};
