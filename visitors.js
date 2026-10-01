// Vercel Node.js serverless function. Keep VERCEL_API_TOKEN server-side only.
const ANALYTICS_START_DATE = '2026-09-30'; // First dates visible in the site's Analytics dashboard.

function dateInIstanbul(date) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Istanbul', year: 'numeric', month: '2-digit', day: '2-digit'
  }).format(date);
}

async function fetchCounts({ token, projectId, slug, since, until }) {
  const url = new URL('https://api.vercel.com/v1/query/web-analytics/visits/count');
  url.searchParams.set('projectId', projectId);
  url.searchParams.set('slug', slug);
  url.searchParams.set('since', since);
  url.searchParams.set('until', until);
  const response = await fetch(url, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' }
  });
  if (!response.ok) throw new Error(`Analytics API returned ${response.status}`);
  const payload = await response.json();
  const visitors = payload && payload.data && payload.data.visitors;
  if (!Number.isFinite(visitors)) throw new Error('Visitor count missing from API response');
  return visitors;
}

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const token = process.env.VERCEL_API_TOKEN;
  // Vercel project name and team slug are not secrets. Adjust only if your dashboard uses different values.
  const projectId = process.env.VERCEL_PROJECT_ID || 'themisbusiness';
  const slug = process.env.VERCEL_TEAM_SLUG || 'juriscope';
  if (!token) return res.status(503).json({ error: 'Analytics is not configured' });
  const now = new Date();
  const today = dateInIstanbul(now);
  try {
    const [todayVisitors, trackedVisitors] = await Promise.all([
      fetchCounts({ token, projectId, slug, since: today, until: now.toISOString() }),
      fetchCounts({ token, projectId, slug, since: ANALYTICS_START_DATE, until: now.toISOString() })
    ]);
    return res.status(200).json({ todayVisitors, trackedVisitors, updatedAt: now.toISOString() });
  } catch (error) {
    // Do not log credentials or upstream response bodies.
    return res.status(502).json({ error: 'Analytics data is temporarily unavailable' });
  }
}
