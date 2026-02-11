import mongoose from 'mongoose';

const pageContentSchema = new mongoose.Schema({
  slug: { type: String, required: true, unique: true },
  pageTitle: { type: String, default: '' },
  content: { type: String, default: '' },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const PageContent = mongoose.models.PageContent || mongoose.model('PageContent', pageContentSchema);
export default PageContent;
