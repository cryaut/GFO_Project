// Local-only static server: node scripts/dev-server.cjs [port]
const http = require('node:http');
const { readFile } = require('node:fs/promises');
const { extname, resolve, sep } = require('node:path');
const root = resolve(__dirname, '..');
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml' };
const server = http.createServer(async (request, response) => {
  try {
    const path = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
    const relative = path === '/' ? 'index.html' : path.slice(1);
    if (relative.split(/[\\/]/).some(part => part.startsWith('.')) || relative.includes('node_modules')) {
      response.writeHead(403); response.end(); return;
    }
    const file = resolve(root, relative);
    if (!file.startsWith(root + sep)) { response.writeHead(403); response.end(); return; }
    const body = await readFile(file);
    response.writeHead(200, { 'Content-Type': mime[extname(file)] || 'application/octet-stream' });
    response.end(body);
  } catch { response.writeHead(404); response.end('Not found'); }
});
if (require.main === module) server.listen(Number(process.argv[2]) || 8080, '127.0.0.1', () => console.log('Servidor local listo'));
module.exports = server;
