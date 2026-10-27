/* nihongo-tool 同步伺服器：serve 靜態頁 + /api/sync 存取單一 JSON（volume 持久化） */
const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const DATA_DIR = process.env.DATA_DIR || '/data';
const DATA_FILE = path.join(DATA_DIR, 'sync.json');
const KEY = process.env.SYNC_KEY || '';
/* 多 key：SYNC_KEYS 逗號分隔，每把 key 各自對應 sync-<sha256前16碼>.json；
   舊 SYNC_KEY 保留、仍對應 sync.json，既有資料零遷移 */
const EXTRA_KEYS = (process.env.SYNC_KEYS || '').split(',').map(s => s.trim()).filter(Boolean);

app.use(express.json({ limit: '5mb' }));

function safeEq(a, b) {
  const ba = Buffer.from(a), bb = Buffer.from(b);
  return ba.length === bb.length && crypto.timingSafeEqual(ba, bb);
}

function fileForToken(token) {
  if (KEY && safeEq(token, KEY)) return DATA_FILE;
  for (const k of EXTRA_KEYS) {
    if (safeEq(token, k)) {
      const h = crypto.createHash('sha256').update(k).digest('hex').slice(0, 16);
      return path.join(DATA_DIR, 'sync-' + h + '.json');
    }
  }
  return null;
}

function auth(req, res, next) {
  if (!KEY && !EXTRA_KEYS.length) return res.status(503).json({ error: 'sync not configured' });
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : '';
  const file = token && fileForToken(token);
  if (!file) return res.status(401).json({ error: 'unauthorized' });
  req.syncFile = file;
  next();
}

app.get('/api/sync', auth, (req, res) => {
  try {
    if (!fs.existsSync(req.syncFile)) return res.json({ empty: true });
    res.type('application/json').send(fs.readFileSync(req.syncFile, 'utf8'));
  } catch (e) { res.status(500).json({ error: 'read failed' }); }
});

app.put('/api/sync', auth, (req, res) => {
  try {
    const body = req.body;
    if (!body || body.app !== 'nihongo-tool') return res.status(400).json({ error: 'bad payload' });
    fs.mkdirSync(DATA_DIR, { recursive: true });
    const tmp = req.syncFile + '.tmp';   // 先寫暫存再改名，避免寫到一半斷電留下半個檔
    fs.writeFileSync(tmp, JSON.stringify(body));
    fs.renameSync(tmp, req.syncFile);
    res.json({ ok: true, savedAt: new Date().toISOString() });
  } catch (e) { res.status(500).json({ error: 'write failed' }); }
});

// 只公開前端兩個檔（原本 express.static(__dirname) 會連 server.js、CLAUDE.md 一起外露）
app.get(['/', '/index.html'], (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/sw.js', (req, res) => res.sendFile(path.join(__dirname, 'sw.js')));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log('nihongo-tool listening on ' + PORT));
