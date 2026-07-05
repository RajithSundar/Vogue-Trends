import mongoose from 'mongoose';

const WishlistSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  productIds: [{ type: String }]
});

export default mongoose.models.Wishlist || mongoose.model('Wishlist', WishlistSchema);
