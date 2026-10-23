import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { initDatabase, seedInitialData } from './db.js';
import apiRouter from './routes/api.js';

// Import existing rich product, category, and brand catalog data
import { CATEGORIES } from '../src/data/categories.js';
import { INITIAL_PRODUCTS } from '../src/data/products.js';
import { BRAND_CONFIG } from '../src/config/brand.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Enable Cross-Origin Resource Sharing
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-owner-pin']
}));

// Body parsers
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Request logging (sanitized, no secrets)
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    console.log(`[API] ${req.method} ${req.path}`);
  }
  next();
});

// Initialize Persistent Relational Database & Seed Data
try {
  initDatabase();
  await seedInitialData(CATEGORIES, INITIAL_PRODUCTS, BRAND_CONFIG);
} catch (err) {
  console.error('Database initialization error:', err);
}

// Mount REST API
app.use('/api', apiRouter);

// Serve static build in production
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// Fallback to index.html for client-side routing
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.status(200).send('Risika Blooms Server is Active.');
    }
  });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`🌸 RISIKA BLOOMS backend server is running on http://localhost:${PORT}`);
  console.log(`📡 REST API mounted at http://localhost:${PORT}/api`);
});
