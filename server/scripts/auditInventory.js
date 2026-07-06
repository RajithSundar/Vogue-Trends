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

const LOW_INVENTORY_THRESHOLD = 5;

function normalizeCountRows(rows, labelField) {
  return rows.map((row) => ({
    [labelField]: row._id,
    count: row.count,
  }));
}

function logLowInventoryWarnings(rows, labelField) {
  for (const row of rows) {
    if (row.count < LOW_INVENTORY_THRESHOLD) {
      console.warn(`WARNING: Low inventory detected in ${row[labelField]}`);
    }
  }
}

async function auditInventory() {
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

    const [categoryDistribution, tagDistribution] = await Promise.all([
      Product.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
        { $sort: { count: -1, _id: 1 } },
      ]),
      Product.aggregate([
        { $unwind: "$tags" },
        { $group: { _id: "$tags", count: { $sum: 1 } } },
        { $sort: { count: -1, _id: 1 } },
      ]),
    ]);

    const categoryRows = normalizeCountRows(categoryDistribution, "category");
    const tagRows = normalizeCountRows(tagDistribution, "tag");

    console.log("\nCategory Distribution");
    console.table(categoryRows);

    console.log("\nTag Distribution");
    console.table(tagRows);

    logLowInventoryWarnings(categoryRows, "category");
    logLowInventoryWarnings(tagRows, "tag");
  } catch (error) {
    console.error("Inventory audit failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

auditInventory();
