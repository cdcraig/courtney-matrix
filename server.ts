import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const app = express();
const PORT = parseInt(process.env.PORT || '3456');
const DATA_DIR = process.env.DATA_DIR || process.cwd();
const DATA_FILE = join(DATA_DIR, 'data.json');
const HISTORY_FILE = join(DATA_DIR, 'history.json');
const PASSWORD = process.env.MATRIX_PASSWORD || 'courtney2026';
const MAX_HISTORY = 20;

console.log(`Config: PORT=${PORT}, DATA_DIR=${DATA_DIR}, DATA_FILE=${DATA_FILE}`);

app.use(cors());
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));

// Image API — store images as separate files to keep data.json small
const IMAGES_DIR = join(DATA_DIR, 'images');
import { mkdirSync } from 'fs';
try { mkdirSync(IMAGES_DIR, { recursive: true }); } catch {}

app.post('/api/image/:id', (req, res) => {
  const { data } = req.body; // base64 data URI
  if (!data) { res.status(400).json({ error: 'no data' }); return; }
  const filePath = join(IMAGES_DIR, `${req.params.id}.txt`);
  writeFileSync(filePath, data);
  res.json({ ok: true, url: `/api/image/${req.params.id}` });
});

app.get('/api/image/:id', (_req, res) => {
  const filePath = join(IMAGES_DIR, `${_req.params.id}.txt`);
  if (existsSync(filePath)) {
    const dataUri = readFileSync(filePath, 'utf-8');
    // Extract mime type and send as image
    const match = dataUri.match(/^data:([^;]+);base64,(.+)$/);
    if (match) {
      const buffer = Buffer.from(match[2], 'base64');
      res.type(match[1]).send(buffer);
    } else {
      res.status(400).send('Invalid image data');
    }
  } else {
    res.status(404).send('Not found');
  }
});

// Undo history helpers
function loadHistory(): string[] {
  if (existsSync(HISTORY_FILE)) {
    try { return JSON.parse(readFileSync(HISTORY_FILE, 'utf-8')); } catch { }
  }
  return [];
}

function saveHistory(history: string[]) {
  writeFileSync(HISTORY_FILE, JSON.stringify(history));
}

function pushHistory(data: string) {
  const history = loadHistory();
  history.push(data);
  if (history.length > MAX_HISTORY) history.shift();
  saveHistory(history);
}

// Password protection
const LOGIN_PAGE = `<!DOCTYPE html>
<html><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Courtney AI — Login</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f5f5f0;display:flex;align-items:center;justify-content:center;min-height:100vh}
.login{background:#fff;border-radius:12px;box-shadow:0 2px 20px rgba(0,0,0,.08);padding:40px;width:340px;text-align:center}
.login h1{color:#0B4628;font-size:20px;margin-bottom:8px}
.login p{color:#888;font-size:13px;margin-bottom:24px}
.login input{width:100%;padding:12px 16px;border:1px solid #ddd;border-radius:8px;font-size:14px;outline:none;margin-bottom:16px}
.login input:focus{border-color:#0B4628}
.login button{width:100%;padding:12px;background:#0B4628;color:white;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer}
.login button:hover{background:#0a3d22}
.error{color:#E53935;font-size:12px;margin-bottom:12px;display:none}
</style></head><body>
<div class="login">
<h1>Courtney AI</h1>
<p>Enter password to access the task matrix</p>
<form method="POST" action="/auth">
<div class="error" id="err">Incorrect password</div>
<input type="password" name="password" placeholder="Password" autofocus>
<button type="submit">Enter</button>
</form>
</div>
<script>if(location.search.includes('error'))document.getElementById('err').style.display='block'</script>
</body></html>`;

app.get('/auth', (_req, res) => {
  res.type('html').send(LOGIN_PAGE);
});

app.post('/auth', express.urlencoded({ extended: false }), (req, res) => {
  if (req.body.password === PASSWORD) {
    res.cookie('matrix_auth', '1', { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'lax', path: '/' });
    res.redirect('/');
  } else {
    res.redirect('/auth?error=1');
  }
});

// Auth middleware — skip for /auth and /api/health
app.use((req, res, next) => {
  if (req.path.startsWith('/auth')) return next();
  if (req.path === '/api/health') return next();
  if (req.cookies?.matrix_auth === '1') return next();
  // Return 401 for API routes so fetch doesn't follow redirects
  if (req.path.startsWith('/api/')) {
    res.status(401).json({ error: 'unauthorized' });
    return;
  }
  res.redirect('/auth');
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

// Data API
app.get('/api/data', (_req, res) => {
  if (existsSync(DATA_FILE)) {
    const raw = readFileSync(DATA_FILE, 'utf-8');
    res.json(JSON.parse(raw));
  } else {
    res.json(null);
  }
});

app.post('/api/data', (req, res) => {
  // Save current state to history before overwriting
  if (existsSync(DATA_FILE)) {
    pushHistory(readFileSync(DATA_FILE, 'utf-8'));
  }
  writeFileSync(DATA_FILE, JSON.stringify(req.body, null, 2));
  res.json({ ok: true });
});

// Undo API
app.post('/api/undo', (_req, res) => {
  const history = loadHistory();
  if (history.length === 0) {
    res.json({ ok: false, message: 'Nothing to undo' });
    return;
  }
  const previous = history.pop()!;
  saveHistory(history);
  writeFileSync(DATA_FILE, previous);
  res.json({ ok: true, data: JSON.parse(previous) });
});

app.get('/api/undo/count', (_req, res) => {
  const history = loadHistory();
  res.json({ count: history.length });
});

// Serve frontend
const distPath = join(process.cwd(), 'dist');
app.use(express.static(distPath));
app.get('/{*splat}', (_req, res) => {
  const index = join(distPath, 'index.html');
  if (existsSync(index)) {
    res.sendFile(index);
  } else {
    res.status(404).send('Build not found. Run: bun run build');
  }
});

// On startup, migrate any base64 images out of data.json into separate files
function migrateImages() {
  if (!existsSync(DATA_FILE)) return;
  try {
    const raw = readFileSync(DATA_FILE, 'utf-8');
    const data = JSON.parse(raw);
    let changed = false;
    for (const col of data.columns || []) {
      if (col.image && col.image.startsWith('data:')) {
        const imgPath = join(IMAGES_DIR, `${col.id}.txt`);
        writeFileSync(imgPath, col.image);
        col.image = `/api/image/${col.id}`;
        changed = true;
        console.log(`Migrated image for column: ${col.name}`);
      }
    }
    if (changed) {
      writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
      console.log('Image migration complete — data.json reduced');
    }
  } catch (e) {
    console.error('Image migration failed:', e);
  }
}

migrateImages();

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Courtney Matrix running on http://localhost:${PORT}`);
});
