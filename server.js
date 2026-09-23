const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const rootDir = __dirname;
const publicDir = path.join(rootDir, 'public');
const dataDir = path.join(rootDir, 'data');
const requestsFile = path.join(dataDir, 'requests.json');
const installerPath = path.join(publicDir, 'downloads', 'ClassCore-Setup-3.5.2.exe');
const allowedOrigin = process.env.ALLOWED_ORIGIN || '';
const adminToken = process.env.ADMIN_TOKEN || '';
const hostedDownloadUrl = process.env.DOWNLOAD_URL || '/downloads/ClassCore-Setup-3.5.2.exe';
const requestLog = new Map();

fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(requestsFile)) {
  fs.writeFileSync(requestsFile, JSON.stringify([], null, 2), 'utf8');
}

app.use(cors({
  origin: allowedOrigin || false,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(publicDir));

app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Content-Security-Policy', "default-src 'self'; style-src 'self' https://fonts.googleapis.com 'unsafe-inline'; font-src https://fonts.gstatic.com; script-src 'self'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'self';");
  next();
});

function rateLimit(req, res, next) {
  const key = req.ip || 'unknown';
  const now = Date.now();
  const recent = (requestLog.get(key) || []).filter((time) => now - time < 60 * 1000);
  if (recent.length >= 10) {
    return res.status(429).json({ ok: false, error: 'Too many requests. Please try again later.' });
  }
  recent.push(now);
  requestLog.set(key, recent);
  next();
}

function cleanText(value, maxLength) {
  return String(value || '').trim().slice(0, maxLength);
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function saveRequest(record) {
  const data = JSON.parse(fs.readFileSync(requestsFile, 'utf8'));
  data.push(record);
  fs.writeFileSync(requestsFile, JSON.stringify(data, null, 2), 'utf8');
}

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    app: 'ClassCore',
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/api/site', (req, res) => {
  res.json({
    name: 'ClassCore',
    tagline: 'Tuition and Institute Management System',
    email: 'coreclass.2025@gmail.com',
    features: [
      'Student & Admission Management',
      'Fees, Expenses & Reports',
      'Attendance & Exam Management',
      'WhatsApp / Communication Tools',
      'Cloud Sync and Data Backup'
    ],
    modules: ['Students', 'Fees', 'Attendance', 'Exams', 'Settings', 'Reports']
  });
});

app.get('/api/downloads', (req, res) => {
  const files = [];
  if (fs.existsSync(installerPath)) {
    const sizeMb = (fs.statSync(installerPath).size / (1024 * 1024)).toFixed(1);
    files.push({
      name: 'ClassCore Desktop Installer',
      file: '/downloads/ClassCore-Setup-3.5.2.exe',
      size: `${sizeMb} MB`,
      type: 'EXE'
    });
  } else if (process.env.DOWNLOAD_URL) {
    files.push({
      name: 'ClassCore Desktop Installer',
      file: hostedDownloadUrl,
      size: process.env.DOWNLOAD_SIZE || 'Windows installer',
      type: 'EXE'
    });
  }
  const guidePath = path.join(publicDir, 'downloads', 'ClassCore-User-Guide.html');
  if (fs.existsSync(guidePath)) {
    const sizeKb = Math.max(1, Math.round(fs.statSync(guidePath).size / 1024));
    files.push({
      name: 'ClassCore User Guide',
      file: '/downloads/ClassCore-User-Guide.html',
      size: `${sizeKb} KB`,
      type: 'GUIDE'
    });
  }

  res.json({ ok: true, files });
});

app.post('/api/contact', rateLimit, (req, res) => {
  const name = cleanText(req.body?.name, 100);
  const email = cleanText(req.body?.email, 160).toLowerCase();
  const phone = cleanText(req.body?.phone, 40);
  const message = cleanText(req.body?.message, 2000);

  if (!name || !email || !message || !isEmail(email)) {
    return res.status(400).json({
      ok: false,
      error: 'Name, email, and message are required.'
    });
  }

  const record = {
    id: Date.now(),
    name: String(name).trim(),
    email: String(email).trim(),
    phone: String(phone || '').trim(),
    message: String(message).trim(),
    createdAt: new Date().toISOString()
  };

  try {
    saveRequest(record);
  } catch (error) {
    console.error('Contact save error:', error.message);
  }

  return res.json({
    ok: true,
    message: 'Thank you. Your message has been received successfully.',
  });
});

app.post('/api/download-request', rateLimit, (req, res) => {
  const name = cleanText(req.body?.name, 100);
  const email = cleanText(req.body?.email, 160).toLowerCase();
  const product = cleanText(req.body?.product || 'ClassCore Desktop', 100);

  if (!name || !email || !isEmail(email)) {
    return res.status(400).json({
      ok: false,
      error: 'Name and email are required to request the download.'
    });
  }

  const record = {
    id: Date.now(),
    name: String(name).trim(),
    email: String(email).trim(),
    product,
    createdAt: new Date().toISOString()
  };

  try {
    saveRequest(record);
  } catch (error) {
    console.error('Download request save error:', error.message);
  }

  return res.json({
    ok: true,
    message: 'Download request recorded successfully.',
    downloadUrl: hostedDownloadUrl,
    product
  });
});

app.get('/api/requests', (req, res) => {
  if (!adminToken || req.get('authorization') !== `Bearer ${adminToken}`) {
    return res.status(404).json({ ok: false, error: 'Not found.' });
  }
  try {
    const data = JSON.parse(fs.readFileSync(requestsFile, 'utf8'));
    res.json({ ok: true, count: data.length, requests: data.slice(-10) });
  } catch (error) {
    res.status(500).json({ ok: false, error: 'Unable to read requests log.' });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`ClassCore website running on http://localhost:${PORT}`);
});
