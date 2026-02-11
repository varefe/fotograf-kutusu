import mongoose from 'mongoose';

const siteThemeSchema = new mongoose.Schema({
  primaryColor: { type: String, default: '#2563eb' },
  primaryDark: { type: String, default: '#1d4ed8' },
  primaryLight: { type: String, default: '#93c5fd' },
  secondaryColor: { type: String, default: '#14b8a6' },
  textColor: { type: String, default: '#0f172a' },
  textLight: { type: String, default: '#64748b' },
  bgColor: { type: String, default: '#ffffff' },
  bgLight: { type: String, default: '#f8fafc' },
  bgGray: { type: String, default: '#f1f5f9' },
  borderColor: { type: String, default: '#e2e8f0' },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

const SiteTheme = mongoose.models.SiteTheme || mongoose.model('SiteTheme', siteThemeSchema);
export default SiteTheme;
