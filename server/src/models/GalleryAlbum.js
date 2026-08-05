import mongoose from 'mongoose';

const photoSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: String,
    caption: String,
    alt: String,
    width: Number,
    height: Number,
    order: { type: Number, default: 0 },
  },
  { _id: true }
);

const albumSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, index: true },
    description: String,
    category: { type: String, enum: ['campus', 'academics', 'cultural', 'sports', 'celebration', 'trip', 'ceremony', 'other'], default: 'other', index: true },
    eventDate: Date,
    cover: { url: String, publicId: String, alt: String },
    photos: { type: [photoSchema], default: [] },
    videoLinks: [{ title: String, youtubeId: String }],
    isPublished: { type: Boolean, default: true, index: true },
    displayOrder: { type: Number, default: 100 },
  },
  { timestamps: true, toJSON: { virtuals: true } }
);

albumSchema.virtual('photoCount').get(function count() { return this.photos?.length || 0; });

export default mongoose.model('GalleryAlbum', albumSchema);
