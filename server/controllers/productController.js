import { DB, isUsingMongoDB } from "../config/db.js";
import Product from "../models/Product.js";

// Helper utility to safely escape special regex characters in tags
const escapeRegExp = (string) => {
  return string.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
};

export const getProducts = async (req, res) => {
  try {
    const products = await DB.products.findAll();
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Failed to fetch products" });
  }
};

export const getProductsByTag = async (req, res) => {
  try {
    const tag = decodeURIComponent(req.params.tag);
    console.log("Searching for tag:", tag);

    let products = [];

    if (isUsingMongoDB) {
      // 1. MongoDB Mode: Query directly via Mongoose Model
      const escapedTag = escapeRegExp(tag);

      const allProducts = await Product.find({}).limit(5);
      console.log(
        "Sample product tags from DB:",
        allProducts.map((product) => product.tags),
      );

      products = await Product.find({
        tags: { $regex: new RegExp(`^${escapedTag}$`, "i") },
      }).sort({ createdAt: -1 });
    } else {
      // 2. Fallback Mode: Retrieve from SQL/In-Memory DB and filter manually
      const allProducts = await DB.products.findAll();

      products = allProducts.filter((product) => {
        if (!product.tags || !Array.isArray(product.tags)) return false;
        // Case-insensitive matching on the tags array
        return product.tags.some((t) => t.toLowerCase() === tag.toLowerCase());
      });

      // Sort by creation date descending
      products.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    console.log("Products found:", products.length);
    res.json(products);
  } catch (error) {
    console.error("Error fetching products by tag:", error);
    res.status(500).json({ message: "Failed to fetch products by tag" });
  }
};

export const addProduct = async (req, res) => {
  try {
    const newProduct = await DB.products.create(req.body);
    res.status(201).json(newProduct);
  } catch (error) {
    console.error("Error adding product:", error);
    res.status(500).json({ message: "Failed to add product" });
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
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(updated);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ message: "Failed to update product" });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await DB.products.delete(id);
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ message: "Failed to delete product" });
  }
};
