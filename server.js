/* nihongo-tool 同步伺服器：serve 靜態頁 + /api/sync 存取單一 JSON（volume 持久化） */
const express = require('express');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const DATA_DIR = process.env.DATA_DIR || '/data';
const DATA_FILE = path.join(DATA_DIR, 'sync.json');
const KEY = process.env.SYNC_KEY || '';

app.use(express.json({ limit: '5mb' }));

function auth(req, res, next) {
  if (!KEY) return res.status(503).json({ error: 'sync not configured' });
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : '';
  const a = Buffer.from(token), b = Buffer.from(KEY);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  next();
}

app.get('/api/sync', auth, (req, res) => {
  try {
    if (!fs.existsSync(DATA_FILE)) return res.json({ empty: true });
    res.type('application/json').send(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (e) { res.status(500).json({ error: 'read failed' }); }
});

app.put('/api/sync', auth, (req, res) => {
  try {
    const body = req.body;
    if (!body || body.app !== 'nihongo-tool') return res.status(400).json({ error: 'bad payload' });
    fs.mkdirSync(DATA_DIR, { recursive: true });
    const tmp = DATA_FILE + '.tmp';   // 先寫暫存再改名，避免寫到一半斷電留下半個檔
    fs.writeFileSync(tmp, JSON.stringify(body));
    fs.renameSync(tmp, DATA_FILE);
    res.json({ ok: true, savedAt: new Date().toISOString() });
  } catch (e) { res.status(500).json({ error: 'write failed' }); }
});

app.use(express.static(__dirname));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log('nihongo-tool listening on ' + PORT));
