import mongoose from 'mongoose';

// Gallery Schema
const gallerySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  description: {
    type: String,
    maxlength: 1000
  },
  image: {
    filename: { type: String, required: true },
    originalName: { type: String, required: true },
    base64: { type: String, required: true },
    mimetype: { type: String },
    size: { type: Number }
  },
  category: {
    type: String,
    required: true,
    trim: true,
    default: 'all'
  },
  size: {
    type: String,
    required: true
  },
  customSize: {
    width: { type: Number },
    height: { type: Number }
  },
  tags: [{
    type: String,
    maxlength: 50
  }],
  isFeatured: {
    type: Boolean,
    default: false
  },
  isVisible: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  viewCount: {
    type: Number,
    default: 0
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Index'ler
gallerySchema.index({ category: 1, isVisible: 1, order: 1 });
gallerySchema.index({ isFeatured: 1, isVisible: 1 });
gallerySchema.index({ tags: 1 });

// Model oluştur
const Gallery = mongoose.model('Gallery', gallerySchema);

export default Gallery;
