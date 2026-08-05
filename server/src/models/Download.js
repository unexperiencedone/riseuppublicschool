import mongoose from 'mongoose';

const downloadSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,
    category: { type: String, enum: ['mandatory_disclosure', 'admission', 'academics', 'syllabus', 'calendar', 'transport', 'forms', 'result', 'other'], default: 'other', index: true },
    file: { name: String, url: { type: String, required: true }, publicId: String, mime: String, sizeKb: Number },
    session: String,
    displayOrder: { type: Number, default: 100 },
    downloads: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export default mongoose.model('Download', downloadSchema);
