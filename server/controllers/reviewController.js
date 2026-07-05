import jwt from 'jsonwebtoken';
import { DB } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'vogue_secret_key_jwt_2026_fallback';

export async function getReviews(req, res) {
  try {
    const { productId } = req.params;
    const reviews = await DB.reviews.findByProductId(productId);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Server error retrieving reviews' });
  }
}

export async function createReview(req, res) {
  try {
    const { productId, rating, comment } = req.body;
    if (!productId || !rating || !comment) {
      return res.status(400).json({ message: 'productId, rating, and comment are required' });
    }

    let reviewerName = 'Anonymous Customer';
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET);
        reviewerName = decoded.name;
      } catch (err) {
        // Ignored, fallback to anonymous
      }
    }

    const review = await DB.reviews.create({
      productId,
      name: reviewerName,
      rating: Number(rating),
      comment
    });

    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ message: 'Server error posting review' });
  }
}
