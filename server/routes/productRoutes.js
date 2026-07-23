import express from 'express';
import { getProducts, getProductsByTag, addProduct, updateProduct, deleteProduct } from '../controllers/productController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/tag/:tag', getProductsByTag);

// Admin only routes for mutating products
router.post('/', requireAdmin, addProduct);
router.put('/:id', requireAdmin, updateProduct);
router.delete('/:id', requireAdmin, deleteProduct);

export default router;
