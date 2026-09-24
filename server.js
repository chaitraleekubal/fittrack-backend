const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const allowedOrigins = (process.env.FRONTEND_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'DENY');
  next();
});
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin not allowed'));
  },
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
}));
app.use(express.json({ limit: '10kb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));
app.use('/api/auth', require('./routes/auth'));

app.use((err, _req, res, _next) => {
  if (err.type === 'entity.too.large') return res.status(413).json({ error: 'Request too large' });
  if (err.message === 'Origin not allowed') return res.status(403).json({ error: 'Origin not allowed' });
  console.error('Request error:', err.message);
  return res.status(500).json({ error: 'Internal server error' });
});

async function start() {
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI must be set');
  if (!process.env.FRONTEND_URL && process.env.NODE_ENV === 'production') {
    throw new Error('FRONTEND_URL must be set in production');
  }
  await mongoose.connect(process.env.MONGO_URI);
  console.log('MongoDB connected');
  app.listen(PORT, '0.0.0.0', () => console.log(`Server listening on ${PORT}`));
}

start().catch((err) => {
  console.error('Server startup failed:', err.message);
  process.exit(1);
});
