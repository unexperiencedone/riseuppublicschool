import mongoose from 'mongoose';

/** Editable CMS pages: about, vision, principal-message, facilities, mandatory disclosure blocks, etc. */
const pageSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, lowercase: true, index: true },   // 'about-us'
    title: { type: String, required: true },
    subtitle: String,
    body: String,                                     // HTML / markdown
    sections: [{ heading: String, content: String, icon: String, image: String, order: Number }],
    hero: { image: String, alt: String },
    seo: { metaTitle: String, metaDescription: String, keywords: [String], ogImage: String },
    isPublished: { type: Boolean, default: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

export default mongoose.model('Page', pageSchema);
