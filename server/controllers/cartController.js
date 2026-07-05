import { DB } from '../config/db.js';

export async function getWishlist(req, res) {
  try {
    const wishlist = await DB.wishlist.findByUserId(req.user.id);
    res.json(wishlist ? wishlist.productIds : []);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving wishlist' });
  }
}

export async function saveWishlist(req, res) {
  try {
    const { productIds } = req.body;
    if (!Array.isArray(productIds)) {
      return res.status(400).json({ message: 'productIds must be an array' });
    }
    const wishlist = await DB.wishlist.save(req.user.id, productIds);
    res.json(wishlist.productIds);
  } catch (error) {
    res.status(500).json({ message: 'Server error saving wishlist' });
  }
}

export async function getCart(req, res) {
  try {
    const cart = await DB.cart.findByUserId(req.user.id);
    res.json(cart ? cart.items : []);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving cart' });
  }
}

export async function saveCart(req, res) {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ message: 'items must be an array' });
    }
    const cart = await DB.cart.save(req.user.id, items);
    res.json(cart.items);
  } catch (error) {
    res.status(500).json({ message: 'Server error saving cart' });
  }
}
