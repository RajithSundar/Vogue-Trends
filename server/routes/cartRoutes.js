import express from 'express';
import { getWishlist, saveWishlist, getCart, saveCart } from '../controllers/cartController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/wishlist', authenticateToken, getWishlist);
router.post('/wishlist', authenticateToken, saveWishlist);
router.get('/cart', authenticateToken, getCart);
router.post('/cart', authenticateToken, saveCart);

export default router;
