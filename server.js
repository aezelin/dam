// ============================================================
// Strip Collage — Serveur local
// · Sert l'interface web (index.html)
// · Convertit PNG → AVIF via sharp  (POST /convert)
// · Sauvegarde les exports sur disque (POST /save)
// · Retourne la liste des fichiers     (GET  /files)
//
// Configuration : modifier EXPORT_DIR ci-dessous
// ============================================================
const http = require('http');
const fs   = require('fs');
const path = require('path');

// ── CONFIGURATION ────────────────────────────────────────────
// Dossier de destination des exports.
// Exemples :
//   Windows local monté en réseau : 'Z:\\exports\\strip-collage'
//   Chemin Linux / macOS           : '/mnt/nas/exports/strip-collage'
//   Relatif au serveur             : './exports'
const EXPORT_DIR = './exports';

// Sous-dossiers automatiques par date (true/false)
const SUBDIR_BY_DATE = true;

// Port du serveur
const PORT = 7842;
// ─────────────────────────────────────────────────────────────

// Créer le dossier d'export s'il n'existe pas
function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}
ensureDir(EXPORT_DIR);

// Tentative de chargement de sharp (optionnel — AVIF)
let sharp = null;
try { sharp = require('sharp'); }
catch (e) { console.warn('⚠️  sharp non installé — export AVIF désactivé (npm install sharp)'); }

// ── Types MIME ───────────────────────────────────────────────
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js'  : 'application/javascript',
  '.css' : 'text/css',
  '.png' : 'image/png',
  '.jpg' : 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.json': 'application/json',
  '.ico' : 'image/x-icon',
};

// ── Helpers ──────────────────────────────────────────────────
function cors(res) {
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Filename, X-Quality, X-Format');
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', c => chunks.push(c));
    req.on('end',  () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function json(res, code, obj) {
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(obj));
}

function getTodaySubdir() {
  const d = new Date();
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

// ── Serveur ──────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  cors(res);
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // ── GET /status ────────────────────────────────────────────
  if (req.method === 'GET' && req.url === '/status') {
    return json(res, 200, {
      ok      : true,
      avif    : !!sharp,
      version : '2.0.0',
      exportDir: path.resolve(EXPORT_DIR),
      subdirByDate: SUBDIR_BY_DATE,
    });
  }

  // ── GET /files ─────────────────────────────────────────────
  // Retourne la liste des fichiers dans EXPORT_DIR (récursif 1 niveau)
  if (req.method === 'GET' && req.url === '/files') {
    try {
      const list = [];
      const walk = (dir, base) => {
        fs.readdirSync(dir).forEach(f => {
          const full = path.join(dir, f);
          const rel  = base ? base + '/' + f : f;
          const stat = fs.statSync(full);
          if (stat.isDirectory()) walk(full, rel);
          else list.push({ name: rel, size: stat.size, mtime: stat.mtime });
        });
      };
      walk(EXPORT_DIR, '');
      return json(res, 200, { files: list, dir: path.resolve(EXPORT_DIR) });
    } catch (e) {
      return json(res, 500, { error: e.message });
    }
  }

  // ── POST /save ─────────────────────────────────────────────
  // Headers attendus :
  //   X-Filename : nom du fichier (ex: becm_800x800_hq.jpg)
  //   Content-Type : image/jpeg | image/png | image/webp
  // Body : blob binaire de l'image
  if (req.method === 'POST' && req.url === '/save') {
    try {
      const filename = decodeURIComponent(req.headers['x-filename'] || 'export.jpg');
      const folder   = req.headers['x-folder'] ? decodeURIComponent(req.headers['x-folder']) : '';

      // Sécurité : empêcher path traversal sur nom et dossier
      const safeName   = path.basename(filename);
      // Sécurité : autoriser les sous-dossiers (segments séparés par /) mais bloquer ..
      const safeFolder = folder
        .replace(/\\/g, '/')          // normaliser backslash
        .split('/')
        .map(s => s.replace(/\.\./g, '').trim())  // supprimer ..
        .filter(Boolean)
        .join(path.sep);

      if (!safeName || safeName.startsWith('.')) {
        return json(res, 400, { error: 'Nom de fichier invalide' });
      }

      // Construire le chemin : EXPORT_DIR / [subdir_date] / [folder] / filename
      let destDir = EXPORT_DIR;
      if (SUBDIR_BY_DATE) destDir = path.join(destDir, getTodaySubdir());
      if (safeFolder)     destDir = path.join(destDir, safeFolder);
      ensureDir(destDir);

      const destPath = path.join(destDir, safeName);
      const body = await readBody(req);
      fs.writeFileSync(destPath, body);

      const saved = path.resolve(destPath);
      console.log(`💾  Sauvegardé : ${saved}  (${(body.length / 1024).toFixed(0)} KB)`);
      return json(res, 200, { ok: true, path: saved, size: body.length });

    } catch (e) {
      console.error('Erreur /save:', e.message);
      return json(res, 500, { error: e.message });
    }
  }

  // ── POST /convert  PNG → AVIF ──────────────────────────────
  if (req.method === 'POST' && req.url === '/convert') {
    if (!sharp) {
      res.writeHead(501, { 'Content-Type': 'text/plain' });
      return res.end('sharp non installé — npm install sharp');
    }
    try {
      const quality  = Math.round(parseFloat(req.headers['x-quality'] || '0.8') * 100);
      const filename = req.headers['x-filename'] || 'export.avif';
      const pngBuf   = await readBody(req);
      const avifBuf  = await sharp(pngBuf)
        .avif({ quality: Math.min(100, Math.max(1, quality)), effort: 4 })
        .toBuffer();

      res.writeHead(200, {
        'Content-Type'       : 'image/avif',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length'     : avifBuf.length,
      });
      res.end(avifBuf);
      console.log(`✅  AVIF  ${filename}  (${(avifBuf.length / 1024).toFixed(0)} KB)`);

    } catch (e) {
      console.error('Erreur /convert:', e.message);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Erreur: ' + e.message);
    }
    return;
  }

  // ── Fichiers statiques ─────────────────────────────────────
  let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
  // Sécurité : rester dans le dossier
  if (!filePath.startsWith(path.resolve(__dirname))) {
    res.writeHead(403); return res.end();
  }
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); return res.end('Not found'); }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log('\n🟢  Strip Collage — serveur local');
  console.log(`   → Interface : http://localhost:${PORT}`);
  console.log(`   → AVIF      : ${sharp ? '✅ disponible' : '❌ npm install sharp'}`);
  console.log(`   → Exports   : ${path.resolve(EXPORT_DIR)}`);
  console.log(`   → Sous-dossiers par date : ${SUBDIR_BY_DATE}\n`);
});
