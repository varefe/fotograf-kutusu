import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  size: { type: String, required: true, trim: true },
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  category: { type: String, default: '', trim: true },
  unitPrice: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  features: { type: [String], default: [] },
  image: { type: String, default: null },
  featured: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

productSchema.index({ order: 1, size: 1 });

const Product = mongoose.model('Product', productSchema);
export default Product;
