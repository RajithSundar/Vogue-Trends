#!/usr/bin/env node
import mongoose from 'mongoose';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory name for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables and preload DNS config
import '../config/env.js';

// Import models and data
import Product from '../models/Product.js';
import { PRODUCTS as localProducts } from '../../src/data/products.js';

// Category and style mappings for FakeStore API
const CATEGORY_MAP = {
  "men's clothing": 'Tops',
  "women's clothing": 'Tops',
  "electronics": 'Accessories',
  "jewelery": 'Accessories'
};

const STYLE_OPTIONS = ['Minimalist', 'Streetwear', 'Athleisure', 'Classic Elegant', 'Bohemian'];
const COLOR_OPTIONS = [
  { name: 'Sage Green', code: '#87a987' },
  { name: 'Sand Beige', code: '#decb9c' },
  { name: 'Olive Green', code: '#3f6212' },
  { name: 'Pure White', code: '#ffffff' },
  { name: 'Midnight Black', code: '#111827' },
  { name: 'Slate Gray', code: '#6b7280' },
  { name: 'Honey Gold', code: '#cca43b' },
  { name: 'Indigo Blue', code: '#2563eb' },
  { name: 'Stone Gray', code: '#8E8E8E' }
];

async function fetchProductsFromAPI() {
  console.log('📦 Fetching products from FakeStore API...');
  
  try {
    const response = await fetch('https://fakestoreapi.com/products');
    if (!response.ok) throw new Error('Failed to fetch products from API');
    
    const products = await response.json();
    console.log(`✅ Successfully fetched ${products.length} products`);
    return products;
  } catch (error) {
    console.error('❌ Error fetching products:', error.message);
    throw error;
  }
}

function mapProductData(fakeProduct) {
  const randomColor = COLOR_OPTIONS[Math.floor(Math.random() * COLOR_OPTIONS.length)];
  const randomStyle = STYLE_OPTIONS[Math.floor(Math.random() * STYLE_OPTIONS.length)];
  
  // Generate tags based on category and product
  let tags = ['fashion', 'boutique'];
  if (fakeProduct.category.includes('men')) tags.push('men');
  if (fakeProduct.category.includes('women')) tags.push('women');
  tags.push(randomStyle.toLowerCase());

  return {
    name: fakeProduct.title,
    category: CATEGORY_MAP[fakeProduct.category] || 'Accessories',
    price: Number((fakeProduct.price * 1.8).toFixed(0)), // Mark up price to be realistic for clothing
    imageUrl: fakeProduct.image,
    description: fakeProduct.description,
    stock: Math.floor(Math.random() * 200) + 20,
    color: randomColor.name,
    colorCode: randomColor.code,
    style: randomStyle,
    tags,
    rating: Math.min(5, Math.max(1, Math.floor(fakeProduct.rating?.rate || 4) + Math.random())),
    reviewsCount: Math.floor(fakeProduct.rating?.count || 10)
  };
}

function getMappedLocalProducts() {
  console.log('📦 Using local product data...');
  return localProducts.map(product => ({
    _id: product.id,
    name: product.name,
    category: product.category,
    price: product.price,
    imageUrl: product.imageUrl,
    description: product.description,
    stock: 100,
    color: product.color,
    colorCode: product.colorCode,
    style: product.style,
    tags: product.tags,
    rating: product.rating,
    reviewsCount: product.reviewsCount
  }));
}

async function seedProducts() {
  console.log('🌱 Starting product seeding process...');
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  
  if (!mongoUri) {
    console.error('❌ MONGO_URI is not set. Please configure your environment variables.');
    process.exit(1);
  }

  // Check if --local flag is provided
  const useLocalData = process.argv.includes('--local');

  try {
    // Connect to MongoDB
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB successfully');

    // Get products based on flag
    let productsToSeed;
    if (useLocalData) {
      productsToSeed = getMappedLocalProducts();
    } else {
      const fakeProducts = await fetchProductsFromAPI();
      productsToSeed = fakeProducts.map(mapProductData);
    }

    // Insert into database
    console.log('💾 Inserting products into database...');
    await Product.deleteMany({}); // Clear existing products
    const result = await Product.insertMany(productsToSeed);
    
    console.log(`✅ Successfully seeded ${result.length} products into the database!`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  } finally {
    // Always disconnect
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the seeding function
seedProducts();
