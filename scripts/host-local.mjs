import fs from 'node:fs';
import http from 'node:http';
import https from 'node:https';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

function parseArgs(argv) {
  const opts = {
    host: process.env.HOST || '0.0.0.0',
    port: Number(process.env.PORT || 4173),
    dir: path.resolve(ROOT_DIR, 'dist'),
    useHttps: false,
    cert: process.env.SSL_CERT || '',
    key: process.env.SSL_KEY || '',
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if ((arg === '--port' || arg === '-p') && argv[i + 1]) {
      opts.port = Number(argv[++i]);
    } else if ((arg === '--host' || arg === '-H') && argv[i + 1]) {
      opts.host = argv[++i];
    } else if (arg === '--dir' && argv[i + 1]) {
      opts.dir = path.resolve(argv[++i]);
    } else if (arg === '--cert' && argv[i + 1]) {
      opts.cert = path.resolve(argv[++i]);
      opts.useHttps = true;
    } else if (arg === '--key' && argv[i + 1]) {
      opts.key = path.resolve(argv[++i]);
      opts.useHttps = true;
    } else if (arg === '--https') {
      opts.useHttps = true;
    }
  }

  return opts;
}

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};

function getLanUrls(protocol, port) {
  const urls = [];
  const ifaces = os.networkInterfaces();
  for (const entries of Object.values(ifaces)) {
    if (!entries) continue;
    for (const iface of entries) {
      if (iface.family === 'IPv4' && !iface.internal && !iface.address.startsWith('169.254.')) {
        urls.push(`${protocol}://${iface.address}:${port}`);
      }
    }
  }
  return urls;
}

const opts = parseArgs(process.argv.slice(2));
const distRoot = opts.dir;
const indexFile = path.join(distRoot, 'index.html');

if (!fs.existsSync(indexFile)) {
  console.error(`\n[Pelican Almanac] Build output not found at ${distRoot}.`);
  console.error('Run "npm run host" (builds + starts) or "npm run build" first.\n');
  process.exit(1);
}

let tlsOptions = null;
if (opts.useHttps) {
  const certPath = opts.cert || path.join(ROOT_DIR, 'certs', 'cert.pem');
  const keyPath = opts.key || path.join(ROOT_DIR, 'certs', 'key.pem');
  if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
    console.error('\n[Pelican Almanac] HTTPS enabled, but cert/key files were not found:');
    console.error(`  cert: ${certPath}`);
    console.error(`  key:  ${keyPath}`);
    console.error('Tip: Generate LAN certs with mkcert or omit --https to run HTTP over LAN.\n');
    process.exit(1);
  }
  tlsOptions = {
    cert: fs.readFileSync(certPath),
    key: fs.readFileSync(keyPath),
  };
}

function handleRequest(req, res) {
  const method = req.method || 'GET';
  if (method !== 'GET' && method !== 'HEAD') {
    res.writeHead(405, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Method Not Allowed');
    return;
  }

  let reqPath = '/';
  try {
    const parsedUrl = new URL(req.url || '/', 'http://localhost');
    reqPath = decodeURIComponent(parsedUrl.pathname);
  } catch {
    res.writeHead(400, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Bad Request');
    return;
  }

  const relativePath = reqPath === '/' ? 'index.html' : reqPath.replace(/^\/+/, '');
  let targetPath = path.resolve(distRoot, relativePath);

  if (targetPath !== distRoot && !targetPath.startsWith(`${distRoot}${path.sep}`)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }

  const isAssetPath =
    relativePath.startsWith('assets/') ||
    relativePath.startsWith('icons/') ||
    relativePath === 'sw.js' ||
    relativePath === 'manifest.webmanifest';

  let existsAsFile = false;
  if (fs.existsSync(targetPath)) {
    const stat = fs.statSync(targetPath);
    if (stat.isDirectory()) {
      const nestedIndex = path.join(targetPath, 'index.html');
      if (fs.existsSync(nestedIndex)) {
        targetPath = nestedIndex;
        existsAsFile = true;
      }
    } else if (stat.isFile()) {
      existsAsFile = true;
    }
  }

  if (!existsAsFile) {
    if (isAssetPath) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Not Found');
      return;
    }
    targetPath = indexFile;
  }

  const ext = path.extname(targetPath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';
  const relServed = path.relative(distRoot, targetPath).replaceAll(path.sep, '/');

  let cacheControl = 'public, max-age=3600';
  if (relServed === 'index.html' || relServed === 'sw.js' || relServed === 'manifest.webmanifest') {
    cacheControl = 'no-cache, no-store, must-revalidate';
  } else if (relServed.startsWith('assets/')) {
    cacheControl = 'public, max-age=31536000, immutable';
  }

  res.writeHead(200, {
    'Content-Type': contentType,
    'Cache-Control': cacheControl,
    'X-Content-Type-Options': 'nosniff',
  });

  if (method === 'HEAD') {
    res.end();
    return;
  }

  const stream = fs.createReadStream(targetPath);
  stream.on('error', () => {
    if (!res.headersSent) {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    }
    res.end('Internal Server Error');
  });
  stream.pipe(res);
}

const protocol = tlsOptions ? 'https' : 'http';
const server = tlsOptions ? https.createServer(tlsOptions, handleRequest) : http.createServer(handleRequest);

server.listen(opts.port, opts.host, () => {
  const lanUrls = getLanUrls(protocol, opts.port);
  console.log('\n==================================================');
  console.log('  Pelican Almanac — Local Hosting Server');
  console.log('==================================================');
  console.log(`  Local:    ${protocol}://localhost:${opts.port}`);
  if (lanUrls.length > 0) {
    for (const url of lanUrls) {
      console.log(`  iPad/LAN: ${url}`);
    }
  } else {
    console.log(`  Network:  ${protocol}://<your-computer-ip>:${opts.port}`);
  }
  console.log('--------------------------------------------------');
  console.log('  On iPad Safari (same Wi-Fi):');
  console.log('   1. Open the iPad/LAN URL above.');
  console.log('   2. Tap Share -> Add to Home Screen.');
  console.log('   3. Before moving to Docker later, export your JSON');
  console.log('      backup in Farm Settings so progress transfers.');
  console.log('==================================================\n');
});

const shutdown = () => {
  server.close(() => process.exit(0));
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
