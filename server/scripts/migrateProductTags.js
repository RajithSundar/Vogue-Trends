#!/usr/bin/env node
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables and preload DNS config
import '../config/env.js';

import Product from "../models/Product.js";
import { PRODUCTS as defaultProducts } from "../../src/data/products.js";

const MARKETING_TAGS = ["Summer Sale", "New Arrivals", "Members Only"];

function mapDefaultProduct(product) {
  const { id, ...rest } = product;
  return {
    _id: id,
    ...rest,
    stock: 100,
  };
}

function pickRandomTag() {
  return MARKETING_TAGS[Math.floor(Math.random() * MARKETING_TAGS.length)];
}

async function migrateProductTags() {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

  if (!mongoUri) {
    console.error(
      "MONGO_URI is not set. Please configure your environment variables.",
    );
    process.exit(1);
  }

  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB successfully");

    const existingCount = await Product.countDocuments();
    if (existingCount === 0) {
      console.log("No products found. Seeding canonical product data first...");
      await Product.insertMany(defaultProducts.map(mapDefaultProduct));
    }

    const products = await Product.find({}, { _id: 1, tags: 1 }).lean();
    console.log(`Found ${products.length} products to update`);

    if (products.length === 0) {
      console.log("No products found. Nothing to migrate.");
      return;
    }

    const operations = products.map((product) => {
      const existingTags = Array.isArray(product.tags) ? product.tags : [];
      const marketingTag = pickRandomTag();
      const updatedTags = [...new Set([...existingTags, marketingTag])];

      return {
        updateOne: {
          filter: { _id: product._id },
          update: { $set: { tags: updatedTags } },
        },
      };
    });

    const result = await Product.bulkWrite(operations, { ordered: false });
    console.log(
      `Updated ${result.modifiedCount ?? products.length} products with marketing tags`,
    );
  } catch (error) {
    console.error("Migration failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

migrateProductTags();
