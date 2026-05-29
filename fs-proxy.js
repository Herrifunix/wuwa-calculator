// Tiny CORS proxy for FatSecret API.
// Run: node fs-proxy.js
// Then cutlog.html calls http://localhost:8787/token and /api instead of FatSecret directly.
// FatSecret sees calls coming from this machine's public IP — whitelist that IP in the FatSecret dashboard.

const http = require('http');
const https = require('https');

const PORT = 8787;
const HOST = '127.0.0.1';

const ROUTES = {
  '/token': 'https://oauth.fatsecret.com/connect/token',
  '/api':   'https://platform.fatsecret.com/rest/server.api',
};

const server = http.createServer((req, res) => {
  const origin = req.headers.origin || '*';
  res.setHeader('Access-Control-Allow-Origin', origin);
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');

  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);

  if (req.method === 'OPTIONS') { res.writeHead(204).end(); return; }

  const [path, qs] = req.url.split('?');
  const base = ROUTES[path];
  if (!base) { console.log('  → 404 unknown route'); res.writeHead(404).end('Unknown route'); return; }
  const target = new URL(base + (qs ? '?' + qs : ''));

  const chunks = [];
  req.on('data', c => chunks.push(c));
  req.on('end', () => {
    const body = Buffer.concat(chunks);
    const forwardHeaders = {};
    if (req.headers['authorization']) forwardHeaders['Authorization'] = req.headers['authorization'];
    if (req.headers['content-type']) forwardHeaders['Content-Type'] = req.headers['content-type'];
    if (body.length) forwardHeaders['Content-Length'] = body.length;

    const upReq = https.request({
      host: target.host,
      path: target.pathname + target.search,
      method: req.method,
      headers: forwardHeaders,
    }, upRes => {
      console.log(`  → ${upRes.statusCode} from ${target.host}`);
      res.writeHead(upRes.statusCode, {
        'Content-Type': upRes.headers['content-type'] || 'application/json',
      });
      upRes.pipe(res);
    });
    upReq.on('error', e => {
      console.error('[proxy error]', e.message);
      res.writeHead(502).end(JSON.stringify({ error: 'proxy_error', message: e.message }));
    });
    if (body.length) upReq.write(body);
    upReq.end();
  });
});

server.listen(PORT, HOST, () => {
  console.log(`FatSecret CORS proxy → http://${HOST}:${PORT}`);
  console.log('  POST /token  → oauth.fatsecret.com/connect/token');
  console.log('  GET  /api    → platform.fatsecret.com/rest/server.api');
  console.log('Keep this window open while you use cutlog.html');
});
