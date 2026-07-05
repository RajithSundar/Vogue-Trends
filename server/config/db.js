import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

// Import Mongoose Models
import MongoUser from '../models/User.js';
import MongoWishlist from '../models/Wishlist.js';
import MongoCart from '../models/Cart.js';
import MongoOrder from '../models/Order.js';
import MongoReview from '../models/Review.js';

// Global variable indicating if MongoDB is connected
export let isUsingMongoDB = false;

// JSON Fallback Local Database
const JSON_DB_PATH = path.join(process.cwd(), 'local_database.json');

const defaultLocalDB = {
  users: [],
  wishlists: [],
  carts: [],
  orders: [],
  reviews: [
    {
      _id: 'rev-default-1',
      productId: 'prod-1',
      name: 'Elena Vance',
      rating: 5,
      comment: 'Absolutely love the heavy drape of this tee. Feels incredibly high quality and fits my minimalist style perfectly.',
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      _id: 'rev-default-2',
      productId: 'prod-1',
      name: 'Marcus K.',
      rating: 4,
      comment: 'Very cozy fabric and clean finish. Color is slightly darker than the photo but still a gorgeous Sage Green.',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]
};

function readLocalDB() {
  try {
    if (!fs.existsSync(JSON_DB_PATH)) {
      fs.writeFileSync(JSON_DB_PATH, JSON.stringify(defaultLocalDB, null, 2));
      return defaultLocalDB;
    }
    const data = fs.readFileSync(JSON_DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading local JSON database:', error);
    return defaultLocalDB;
  }
}

function writeLocalDB(data) {
  try {
    fs.writeFileSync(JSON_DB_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing local JSON database:', error);
  }
}

// Connect to MongoDB if MONGO_URI is set, else log fallback
export async function connectDatabase() {
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  if (mongoUri) {
    try {
      console.log('Connecting to MongoDB...');
      await mongoose.connect(mongoUri);
      isUsingMongoDB = true;
      console.log('✅ Successfully connected to MongoDB Atlas!');
    } catch (err) {
      console.error('❌ MongoDB Connection Failure, falling back to local database file:', err);
      isUsingMongoDB = false;
    }
  } else {
    console.log('ℹ️ MONGO_URI is not set. Using local file-based database (local_database.json).');
    isUsingMongoDB = false;
  }
}

// Unified Database API
export const DB = {
  users: {
    async findOne(filter) {
      if (isUsingMongoDB) {
        const user = await MongoUser.findOne(filter);
        return user ? user.toObject() : null;
      } else {
        const db = readLocalDB();
        if (filter.email) {
          return db.users.find(u => u.email.toLowerCase() === filter.email.toLowerCase()) || null;
        }
        if (filter._id) {
          return db.users.find(u => u._id === filter._id) || null;
        }
        return null;
      }
    },

    async create(userData) {
      if (isUsingMongoDB) {
        const user = new MongoUser(userData);
        await user.save();
        return user.toObject();
      } else {
        const db = readLocalDB();
        const newUser = {
          ...userData,
          _id: 'user_' + Math.random().toString(36).substr(2, 9)
        };
        db.users.push(newUser);
        writeLocalDB(db);
        return newUser;
      }
    },

    async updatePreferredStyle(userId, style) {
      if (isUsingMongoDB) {
        const user = await MongoUser.findByIdAndUpdate(userId, { preferredStyle: style }, { new: true });
        return user ? user.toObject() : null;
      } else {
        const db = readLocalDB();
        const userIndex = db.users.findIndex(u => u._id === userId);
        if (userIndex !== -1) {
          db.users[userIndex].preferredStyle = style;
          writeLocalDB(db);
          return db.users[userIndex];
        }
        return null;
      }
    }
  },

  wishlist: {
    async findByUserId(userId) {
      if (isUsingMongoDB) {
        const wishlist = await MongoWishlist.findOne({ userId });
        return wishlist ? wishlist.toObject() : null;
      } else {
        const db = readLocalDB();
        return db.wishlists.find(w => w.userId === userId) || null;
      }
    },

    async save(userId, productIds) {
      if (isUsingMongoDB) {
        const wishlist = await MongoWishlist.findOneAndUpdate(
          { userId },
          { productIds },
          { upsert: true, new: true }
        );
        return wishlist.toObject();
      } else {
        const db = readLocalDB();
        let wishlist = db.wishlists.find(w => w.userId === userId);
        if (!wishlist) {
          wishlist = {
            _id: 'wish_' + Math.random().toString(36).substr(2, 9),
            userId,
            productIds: []
          };
          db.wishlists.push(wishlist);
        }
        wishlist.productIds = productIds;
        writeLocalDB(db);
        return wishlist;
      }
    }
  },

  cart: {
    async findByUserId(userId) {
      if (isUsingMongoDB) {
        const cart = await MongoCart.findOne({ userId });
        return cart ? cart.toObject() : null;
      } else {
        const db = readLocalDB();
        return db.carts.find(c => c.userId === userId) || null;
      }
    },

    async save(userId, items) {
      if (isUsingMongoDB) {
        const cart = await MongoCart.findOneAndUpdate(
          { userId },
          { items },
          { upsert: true, new: true }
        );
        return cart.toObject();
      } else {
        const db = readLocalDB();
        let cart = db.carts.find(c => c.userId === userId);
        if (!cart) {
          cart = {
            _id: 'cart_' + Math.random().toString(36).substr(2, 9),
            userId,
            items: []
          };
          db.carts.push(cart);
        }
        cart.items = items;
        writeLocalDB(db);
        return cart;
      }
    }
  },

  orders: {
    async findByUserId(userId) {
      if (isUsingMongoDB) {
        const orders = await MongoOrder.find({ userId }).sort({ createdAt: -1 });
        return orders.map((o) => o.toObject());
      } else {
        const db = readLocalDB();
        return (db.orders || [])
          .filter(o => o.userId === userId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
    },

    async findAll() {
      if (isUsingMongoDB) {
        const orders = await MongoOrder.find({}).sort({ createdAt: -1 });
        return orders.map((o) => o.toObject());
      } else {
        const db = readLocalDB();
        return (db.orders || [])
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
    },

    async updateStatus(orderId, status) {
      if (isUsingMongoDB) {
        // Handle potential Mongo ObjectId casting
        const query = mongoose.Types.ObjectId.isValid(orderId) ? { _id: orderId } : { _id: orderId };
        const order = await MongoOrder.findOneAndUpdate(query, { status }, { new: true });
        return order ? order.toObject() : null;
      } else {
        const db = readLocalDB();
        const orderIndex = db.orders.findIndex(o => o._id === orderId);
        if (orderIndex !== -1) {
          db.orders[orderIndex].status = status;
          writeLocalDB(db);
          return db.orders[orderIndex];
        }
        return null;
      }
    },

    async create(userId, orderData) {
      const fullOrder = {
        ...orderData,
        userId,
        status: orderData.status || 'Processing',
        discount: orderData.discount || 0,
        createdAt: new Date().toISOString()
      };

      if (isUsingMongoDB) {
        const order = new MongoOrder(fullOrder);
        await order.save();
        return order.toObject();
      } else {
        const db = readLocalDB();
        const newOrder = {
          ...fullOrder,
          _id: 'order_' + Math.random().toString(36).substr(2, 9)
        };
        db.orders = db.orders || [];
        db.orders.push(newOrder);
        writeLocalDB(db);
        return newOrder;
      }
    }
  },

  reviews: {
    async findByProductId(productId) {
      if (isUsingMongoDB) {
        const reviews = await MongoReview.find({ productId }).sort({ createdAt: -1 });
        return reviews.map((r) => r.toObject());
      } else {
        const db = readLocalDB();
        return db.reviews
          .filter(r => r.productId === productId)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
    },

    async create(reviewData) {
      const fullReview = {
        ...reviewData,
        createdAt: new Date().toISOString()
      };

      if (isUsingMongoDB) {
        const review = new MongoReview(fullReview);
        await review.save();
        return review.toObject();
      } else {
        const db = readLocalDB();
        const newReview = {
          ...fullReview,
          _id: 'rev_' + Math.random().toString(36).substr(2, 9)
        };
        db.reviews.push(newReview);
        writeLocalDB(db);
        return newReview;
      }
    }
  }
};
