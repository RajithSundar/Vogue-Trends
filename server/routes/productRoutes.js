import express from 'express';
import { getProducts, getProductsByTag, addProduct, updateProduct, deleteProduct } from '../controllers/productController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/tag/:tag', getProductsByTag);

// Admin only routes for mutating products
// Using authenticateToken, could add role check if roles existed, but for now just token auth
router.post('/', authenticateToken, addProduct);
router.put('/:id', authenticateToken, updateProduct);
router.delete('/:id', authenticateToken, deleteProduct);

export default router;
