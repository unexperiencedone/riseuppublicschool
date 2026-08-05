import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    role: { type: String, default: 'Parent' },     // Parent / Alumnus / Student
    relation: String,                              // "Father of Aarav, Class V"
    message: { type: String, required: true, maxlength: 800 },
    rating: { type: Number, min: 1, max: 5, default: 5 },
    photo: { url: String, publicId: String },
    isApproved: { type: Boolean, default: false, index: true },
    displayOrder: { type: Number, default: 100 },
  },
  { timestamps: true }
);

export default mongoose.model('Testimonial', testimonialSchema);
