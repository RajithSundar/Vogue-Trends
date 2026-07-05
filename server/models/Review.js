import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  createdAt: { type: String, required: true }
});

export default mongoose.models.Review || mongoose.model('Review', ReviewSchema);
