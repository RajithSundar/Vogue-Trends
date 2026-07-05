import './server/config/env.js'; // Must be first to load env vars before routing imports
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';

// Configurations & Imports
import { connectDatabase, isUsingMongoDB } from './server/config/db.js';
import { PRODUCTS } from './src/data/products.js';

// Import Route Handlers
import authRoutes from './server/routes/authRoutes.js';
import cartRoutes from './server/routes/cartRoutes.js';
import orderRoutes from './server/routes/orderRoutes.js';
import reviewRoutes from './server/routes/reviewRoutes.js';
import personalizeRoutes from './server/routes/personalizeRoutes.js';

const app = express();
const PORT = 3000;

app.use(express.json());

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api', cartRoutes); // matches /api/wishlist and /api/cart
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/personalize', personalizeRoutes); // matches /api/personalize and /api/personalize/chat

// Public Catalog API
app.get('/api/products', (req, res) => {
  res.json(PRODUCTS);
});

// Add product to catalog in-memory listing
app.post('/api/products', (req, res) => {
  const newProduct = {
    ...req.body,
    id: 'prod-' + (PRODUCTS.length + 1)
  };
  PRODUCTS.push(newProduct);
  res.status(201).json(newProduct);
});

// Database Status API
app.get('/api/db-status', (req, res) => {
  res.json({ isUsingMongoDB });
});

// Setup Dev vs Production SPA servers
async function startServer() {
  // Connect to Database (MongoDB Atlas with Local JSON fallback)
  await connectDatabase();

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Only bind port listener if not running in serverless Vercel environment
  if (!process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  }
}

startServer();

export default app;
