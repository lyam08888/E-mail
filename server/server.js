require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const { fetchAllJobs } = require('./sources');
const { aiFilterJobs } = require('./utils/ai');
const { memoryStore } = require('./utils/store');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Health
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Get jobs
app.get('/api/jobs', (req, res) => {
  const { q, location, seniority } = req.query;
  let jobs = memoryStore.getJobs();

  if (q) {
    const ql = q.toLowerCase();
    jobs = jobs.filter(j =>
      (j.title||'').toLowerCase().includes(ql) ||
      (j.company||'').toLowerCase().includes(ql) ||
      (j.description||'').toLowerCase().includes(ql)
    );
  }
  if (location) {
    const loc = location.toLowerCase();
    jobs = jobs.filter(j => (j.location||'').toLowerCase().includes(loc));
  }
  if (seniority) {
    const s = seniority.toLowerCase();
    jobs = jobs.filter(j => (j.seniority||'').toLowerCase().includes(s));
  }

  res.json({ count: jobs.length, items: jobs });
});

// Trigger update now
app.post('/api/jobs/update', async (req, res) => {
  try {
    const rawJobs = await fetchAllJobs();
    const filtered = await aiFilterJobs(rawJobs);
    memoryStore.setJobs(filtered);
    res.json({ updated: filtered.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update jobs' });
  }
});

// Schedule periodic refresh every hour
cron.schedule('0 * * * *', async () => {
  try {
    const rawJobs = await fetchAllJobs();
    const filtered = await aiFilterJobs(rawJobs);
    memoryStore.setJobs(filtered);
    console.log(`[CRON] Updated jobs: ${filtered.length}`);
  } catch (e) {
    console.error('[CRON] update failed', e);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Initial warm-up to populate jobs on start (non-blocking)
(async () => {
  try {
    const rawJobs = await fetchAllJobs();
    const filtered = await aiFilterJobs(rawJobs);
    memoryStore.setJobs(filtered);
    console.log(`[INIT] Jobs loaded: ${filtered.length}`);
  } catch (e) {
    console.warn('[INIT] Failed to load jobs initially');
  }
})();
