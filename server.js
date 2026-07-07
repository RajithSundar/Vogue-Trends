import './server/config/env.js'; // Must be first to load env vars before routing imports
import express from 'express';
import path from 'path';
import cors from 'cors';

// Configurations & Imports
import { connectDatabase, isUsingMongoDB } from './server/config/db.js';

// Import Route Handlers
import authRoutes from './server/routes/authRoutes.js';
import cartRoutes from './server/routes/cartRoutes.js';
import orderRoutes from './server/routes/orderRoutes.js';
import reviewRoutes from './server/routes/reviewRoutes.js';
import personalizeRoutes from './server/routes/personalizeRoutes.js';
import productRoutes from './server/routes/productRoutes.js';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Initialize Database connection promise
const dbReady = connectDatabase();

// Middleware to ensure DB is connected before handling API requests
app.use('/api', async (req, res, next) => {
  await dbReady;
  next();
});

// Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api', cartRoutes); // matches /api/wishlist and /api/cart
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/personalize', personalizeRoutes); // matches /api/personalize and /api/personalize/chat
app.use('/api/products', productRoutes);

// Database Status API
app.get('/api/db-status', (req, res) => {
  res.json({ isUsingMongoDB });
});

// Static file serving removed: Backend now acts exclusively as an API for decoupled frontend

// Setup Dev Server and start listening
async function startDevServer() {
  if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  }
}

startDevServer();

export default app;
