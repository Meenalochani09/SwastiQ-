// Run the whole app on your own computer: node local-server.js
// Reads GNANI_API_KEY from .env.local, serves /public and the /api functions.
const http = require('http'), fs = require('fs'), path = require('path');
const PORT = process.env.PORT || 8000;
try {
  for (const line of fs.readFileSync(path.join(__dirname, '.env.local'), 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (m && !line.trim().startsWith('#')) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
} catch (e) { console.log('No .env.local found. Voice will be off until you create it.'); }
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.png': 'image/png', '.mp3': 'audio/mpeg' };
http.createServer(async (req, res) => {
  const u = new URL(req.url, 'http://localhost');
  if (u.pathname.startsWith('/api/')) {
    const f = path.join(__dirname, 'api', path.basename(u.pathname) + '.js');
    if (!fs.existsSync(f)) { res.statusCode = 404; return res.end('Not found'); }
    req.query = Object.fromEntries(u.searchParams);
    if ((req.headers['content-type'] || '').includes('json')) {
      let b = ''; for await (const c of req) b += c;
      try { req.body = JSON.parse(b); } catch (e) {}
    }
    res.status = c => { res.statusCode = c; return res; };
    res.json = o => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(o)); };
    res.send = b => res.end(b);
    return require(f)(req, res);
  }
  const p = path.join(__dirname, 'public', u.pathname === '/' ? 'index.html' : u.pathname);
  if (!p.startsWith(path.join(__dirname, 'public')) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.statusCode = 404; return res.end('Not found'); }
  res.setHeader('Content-Type', types[path.extname(p)] || 'application/octet-stream');
  res.end(fs.readFileSync(p));
}).listen(PORT, () => console.log('SwastiQ running at http://localhost:' + PORT));
