import mongoose from 'mongoose';

const homeworkSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: String,
    subject: { type: String, required: true },
    classLevel: { type: String, required: true, index: true },
    section: { type: String, default: 'A' },
    session: { type: String, default: '2026-27' },
    assignedOn: { type: Date, default: Date.now, index: true },
    dueDate: Date,
    attachments: [{ name: String, url: String, publicId: String }],
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Staff' },
    isPublished: { type: Boolean, default: true },
  },
  { timestamps: true }
);

homeworkSchema.index({ classLevel: 1, section: 1, assignedOn: -1 });

export default mongoose.model('Homework', homeworkSchema);
