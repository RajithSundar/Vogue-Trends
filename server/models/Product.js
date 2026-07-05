import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => 'prod-' + new mongoose.Types.ObjectId().toHexString(),
    },
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    stock: {
      type: Number,
      default: 100,
      min: 0,
    },
    color: {
      type: String,
    },
    colorCode: {
      type: String,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviewsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    style: {
      type: String,
    },
    tags: {
      type: [String],
      default: [],
    },
    imageUrl: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Add text indexes for search if necessary later
productSchema.index({ name: 'text', description: 'text', tags: 'text' });

const Product = mongoose.models.Product || mongoose.model('Product', productSchema);

export default Product;
