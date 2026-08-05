import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    subject: { type: String, default: 'General enquiry' },
    message: { type: String, required: true, maxlength: 2000 },
    category: { type: String, enum: ['admission', 'academic', 'transport', 'fee', 'complaint', 'career', 'general'], default: 'general', index: true },
    status: { type: String, enum: ['new', 'read', 'responded', 'closed', 'spam'], default: 'new', index: true },
    respondedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    responseNote: String,
    ipAddress: String,
  },
  { timestamps: true }
);

export default mongoose.model('ContactMessage', contactSchema);
