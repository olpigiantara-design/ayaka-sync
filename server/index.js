require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/plans', require('./routes/plans'));
app.use('/api/activation', require('./routes/activation'));
app.use('/api/history', require('./routes/history'));
app.use('/api/bulk', require('./routes/bulk'));
app.use('/api/chat', require('./routes/chat'));

app.get('/api/health', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

const publicDir = path.join(__dirname, '..', 'public');
app.use(express.static(publicDir));
app.get('*', (req, res) => res.sendFile(path.join(publicDir, 'index.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Ayaka Sync running → http://localhost:${PORT}`));