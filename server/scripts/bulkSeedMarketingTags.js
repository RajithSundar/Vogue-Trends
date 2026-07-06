#!/usr/bin/env node
import mongoose from "mongoose";
import fetch from "node-fetch";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables and preload DNS config
import '../config/env.js';

import Product from "../models/Product.js";

const TARGET_COUNT = 15;
const MARKETING_TAGS = ["Summer Sale", "New Arrivals", "Members Only"];
const DUMMYJSON_CATEGORIES_BY_TAG = {
  "Summer Sale": ["womens-dresses", "womens-shoes", "tops"],
  "New Arrivals": ["mens-shirts", "mens-shoes", "womens-bags"],
  "Members Only": ["womens-watches", "mens-watches", "sunglasses"],
};

const CATEGORY_MAP = {
  "womens-dresses": "Tops",
  "mens-shirts": "Tops",
  tops: "Tops",
  "womens-shoes": "Footwear",
  "mens-shoes": "Footwear",
  "womens-bags": "Accessories",
  "womens-watches": "Accessories",
  "mens-watches": "Accessories",
  sunglasses: "Accessories",
};

const FALLBACK_COLORS = [
  { name: "Ivory", code: "#f8f5ef" },
  { name: "Charcoal", code: "#2f2f33" },
  { name: "Olive", code: "#6b8e23" },
  { name: "Sand", code: "#d9c5a1" },
  { name: "Indigo", code: "#334155" },
];

function slugifyTag(tag) {
  return tag.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function pickColor(seed) {
  return FALLBACK_COLORS[seed % FALLBACK_COLORS.length];
}

function normalizeCategory(category) {
  return CATEGORY_MAP[category] || "Accessories";
}

async function fetchDummyJsonCategory(category) {
  const response = await fetch(
    `https://dummyjson.com/products/category/${encodeURIComponent(category)}`,
  );
  if (!response.ok) {
    throw new Error(`Failed to fetch DummyJSON category ${category}`);
  }

  const payload = await response.json();
  return payload.products || [];
}

function buildProductDocument(sourceProduct, marketingTag, sequence) {
  const color = pickColor(sourceProduct.id + sequence);
  const fallbackTags = [marketingTag, sourceProduct.category, "fashion"];

  return {
    _id: `dummyjson-${slugifyTag(marketingTag)}-${sourceProduct.id}-${sequence}`,
    name: sourceProduct.title,
    category: normalizeCategory(sourceProduct.category),
    price: Math.max(10, Math.round(sourceProduct.price * 1.35)),
    stock: 100,
    color: color.name,
    colorCode: color.code,
    rating: Math.min(5, Math.max(1, Math.round(sourceProduct.rating || 4))),
    reviewsCount: Math.max(0, sourceProduct.reviews?.length || 0),
    style: marketingTag,
    tags: [...new Set(fallbackTags)],
    imageUrl: sourceProduct.thumbnail,
    description: sourceProduct.description,
  };
}

async function getMarketingTagCounts() {
  const counts = await Promise.all(
    MARKETING_TAGS.map(async (tag) => [
      tag,
      await Product.countDocuments({ tags: tag }),
    ]),
  );

  return Object.fromEntries(counts);
}

async function bulkSeedMarketingTags() {
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

    const currentCounts = await getMarketingTagCounts();
    const summaryRows = MARKETING_TAGS.map((tag) => {
      const currentCount = currentCounts[tag] || 0;
      return {
        tag,
        currentCount,
        targetCount: TARGET_COUNT,
        toAdd: Math.max(0, TARGET_COUNT - currentCount),
      };
    });

    console.log("\nMarketing Tag Inventory");
    console.table(summaryRows);

    const deficits = summaryRows.filter((row) => row.toAdd > 0);

    if (deficits.length === 0) {
      console.log(
        "All marketing tags already meet the 15-item threshold. No bulk seed required.",
      );
      return;
    }

    const existingNames = new Set(
      (await Product.find({}, { name: 1 }).lean()).map(
        (product) => product.name,
      ),
    );
    const productsToInsert = [];

    for (const deficit of deficits) {
      const candidateCategories =
        DUMMYJSON_CATEGORIES_BY_TAG[deficit.tag] || [];
      const candidatePool = [];

      for (const category of candidateCategories) {
        const categoryProducts = await fetchDummyJsonCategory(category);
        candidatePool.push(...categoryProducts);
      }

      const uniqueCandidates = candidatePool.filter(
        (product) => !existingNames.has(product.title),
      );

      if (uniqueCandidates.length < deficit.toAdd) {
        throw new Error(
          `Not enough DummyJSON products available to top up ${deficit.tag}`,
        );
      }

      for (let index = 0; index < deficit.toAdd; index += 1) {
        const sourceProduct = uniqueCandidates[index];
        existingNames.add(sourceProduct.title);
        productsToInsert.push(
          buildProductDocument(sourceProduct, deficit.tag, index + 1),
        );
      }
    }

    if (productsToInsert.length === 0) {
      console.log("No new products were generated for insertion.");
      return;
    }

    const insertedProducts = await Product.insertMany(productsToInsert, {
      ordered: false,
    });
    console.log(
      `Inserted ${insertedProducts.length} new products to strengthen marketing-tag inventory.`,
    );

    const updatedCounts = await getMarketingTagCounts();
    console.log("\nUpdated Marketing Tag Inventory");
    console.table(
      MARKETING_TAGS.map((tag) => ({
        tag,
        currentCount: updatedCounts[tag] || 0,
        targetCount: TARGET_COUNT,
        toAdd: Math.max(0, TARGET_COUNT - (updatedCounts[tag] || 0)),
      })),
    );
  } catch (error) {
    console.error("Marketing tag bulk seed failed:", error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

bulkSeedMarketingTags();
