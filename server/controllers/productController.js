import { DB } from '../config/db.js';

export const getProducts = async (req, res) => {
  try {
    const products = await DB.products.findAll();
    res.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
};

export const addProduct = async (req, res) => {
  try {
    const newProduct = await DB.products.create(req.body);
    res.status(201).json(newProduct);
  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ message: 'Failed to add product' });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { price, stock } = req.body;
    
    const updateData = {};
    if (price !== undefined) updateData.price = Number(price);
    if (stock !== undefined) updateData.stock = Number(stock);

    const updated = await DB.products.update(id, updateData);
    if (!updated) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(updated);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Failed to update product' });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await DB.products.delete(id);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Failed to delete product' });
  }
};
