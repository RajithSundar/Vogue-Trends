import mongoose from 'mongoose';

const CartSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  items: [{
    productId: { type: String, required: true },
    quantity: { type: Number, required: true, default: 1 },
    selectedSize: { type: String, required: true }
  }]
});

export default mongoose.models.Cart || mongoose.model('Cart', CartSchema);
