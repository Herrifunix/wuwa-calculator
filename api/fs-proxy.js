// Vercel serverless function: proxy for FatSecret API
// Makes token requests and search requests from the browser possible

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  const { path, ...query } = req.query;

  if (!path) {
    res.status(400).json({ error: 'Missing path parameter' });
    return;
  }

  const routes = {
    'token': 'https://oauth.fatsecret.com/connect/token',
    'api': 'https://platform.fatsecret.com/rest/server.api',
  };

  const target = routes[path];
  if (!target) {
    res.status(404).json({ error: 'Unknown path' });
    return;
  }

  const forwardHeaders = {};
  if (req.headers.authorization) {
    forwardHeaders['Authorization'] = req.headers.authorization;
  }
  if (req.headers['content-type']) {
    forwardHeaders['Content-Type'] = req.headers['content-type'];
  }

  let body = '';
  if (req.method === 'POST') {
    // For POST, body is already parsed by Vercel
    if (typeof req.body === 'string') {
      body = req.body;
    } else if (req.body) {
      body = new URLSearchParams(req.body).toString();
    }
    if (body) {
      forwardHeaders['Content-Length'] = Buffer.byteLength(body);
    }
  }

  // Build query string
  const qs = new URLSearchParams(query).toString();
  const url = target + (qs ? '?' + qs : '');

  try {
    const upRes = await fetch(url, {
      method: req.method,
      headers: forwardHeaders,
      body: body || undefined,
    });

    const upBody = await upRes.text();
    res.status(upRes.status).setHeader('Content-Type', upRes.headers.get('content-type') || 'application/json').send(upBody);
  } catch (e) {
    console.error('[fs-proxy error]', e);
    res.status(502).json({ error: 'proxy_error', message: e.message });
  }
}
