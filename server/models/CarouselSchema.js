import mongoose from 'mongoose';

const carouselSlideSchema = new mongoose.Schema({
  image: { type: String, required: true }, // URL
  alt: { type: String, default: '' },
  title: { type: String, default: '' },
  subtitle: { type: String, default: '' },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const CarouselSlide = mongoose.models.CarouselSlide || mongoose.model('CarouselSlide', carouselSlideSchema);
export default CarouselSlide;
