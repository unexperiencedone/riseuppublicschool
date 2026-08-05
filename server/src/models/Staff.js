import mongoose from 'mongoose';

const staffSchema = new mongoose.Schema(
  {
    employeeId: { type: String, unique: true, sparse: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    designation: { type: String, required: true, trim: true },      // e.g. "PGT Physics", "Principal"
    department: { type: String, enum: ['management', 'administration', 'primary', 'middle', 'secondary', 'senior_secondary', 'sports', 'arts', 'support'], default: 'administration', index: true },
    category: { type: String, enum: ['teaching', 'non_teaching', 'management'], default: 'teaching', index: true },
    qualifications: [String],                                        // ["M.Sc.", "B.Ed."]
    subjects: [String],
    experienceYears: { type: Number, default: 0 },
    adminExperienceYears: { type: Number, default: 0 },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, trim: true },
    photo: { url: String, publicId: String },
    bio: { type: String, maxlength: 1500 },
    joinedOn: Date,
    displayOrder: { type: Number, default: 100 },
    showOnWebsite: { type: Boolean, default: true, index: true },
    isActive: { type: Boolean, default: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

staffSchema.index({ showOnWebsite: 1, displayOrder: 1 });

export default mongoose.model('Staff', staffSchema);
