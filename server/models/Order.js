import mongoose from 'mongoose';

const OrderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  items: [{
    productId: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true },
    selectedSize: { type: String, required: true },
    imageUrl: { type: String, required: true }
  }],
  subtotal: { type: Number, required: true },
  deliveryFee: { type: Number, required: true },
  discount: { type: Number, default: 0, required: true },
  total: { type: Number, required: true },
  shippingAddress: {
    name: { type: String, required: true },
    email: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true }
  },
  status: { type: String, default: 'Processing', required: true },
  createdAt: { type: String, required: true }
});

export default mongoose.models.Order || mongoose.model('Order', OrderSchema);
