import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  slug: {
    type: String,
    trim: true,
    lowercase: true,
    maxlength: 100
  },
  order: {
    type: Number,
    default: 0
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

categorySchema.index({ order: 1 });
categorySchema.index({ slug: 1 }, { unique: true, sparse: true });

const Category = mongoose.model('Category', categorySchema);
export default Category;
