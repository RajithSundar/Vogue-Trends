import { DB } from '../config/db.js';

export async function getOrders(req, res) {
  try {
    const orders = await DB.orders.findByUserId(req.user.id);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving orders' });
  }
}

export async function getAllOrders(req, res) {
  try {
    const orders = await DB.orders.findAll();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving all orders' });
  }
}

export async function updateOrderStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    const order = await DB.orders.updateStatus(id, status);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(order);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ message: 'Server error updating order status' });
  }
}

export async function createOrder(req, res) {
  try {
    const { items, subtotal, deliveryFee, discount, total, shippingAddress } = req.body;
    if (!items || !shippingAddress) {
      return res.status(400).json({ message: 'Items and shippingAddress are required' });
    }

    const order = await DB.orders.create(req.user.id, {
      items,
      subtotal,
      deliveryFee,
      discount: Number(discount || 0),
      total,
      shippingAddress
    });

    // Clear user cart in DB
    await DB.cart.save(req.user.id, []);

    res.status(201).json(order);
  } catch (error) {
    console.error('Error placing order:', error);
    res.status(500).json({ message: 'Server error placing order' });
  }
}
