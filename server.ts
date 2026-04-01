import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const app = express();
const PORT = parseInt(process.env.PORT || '3456');
const DATA_DIR = process.env.DATA_DIR || process.cwd();
const DATA_FILE = join(DATA_DIR, 'data.json');
const PASSWORD = process.env.MATRIX_PASSWORD || 'courtney2026';

console.log(`Config: PORT=${PORT}, DATA_DIR=${DATA_DIR}, DATA_FILE=${DATA_FILE}`);

app.use(cors());
app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));

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
    res.cookie('matrix_auth', '1', { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'lax' });
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
  writeFileSync(DATA_FILE, JSON.stringify(req.body, null, 2));
  res.json({ ok: true });
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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Courtney Matrix running on http://localhost:${PORT}`);
});
