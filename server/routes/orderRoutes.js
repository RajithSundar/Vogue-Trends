import express from 'express';
import { getOrders, createOrder, getAllOrders, updateOrderStatus } from '../controllers/orderController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, getOrders);
router.get('/all', authenticateToken, getAllOrders);
router.post('/', authenticateToken, createOrder);
router.put('/:id/status', authenticateToken, updateOrderStatus);

export default router;
