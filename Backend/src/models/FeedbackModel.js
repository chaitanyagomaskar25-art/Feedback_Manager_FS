import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 80,
  },
  rating: {
    type: Number,
    required: 'Rating is required.',
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: 'Comment is required',
    trim: true,
    maxlength: 2000,
  },
  category: {
    type: String,
    enum: ['Product', 'Service', 'Teaching', 'Event', 'Other'],
    default: 'Other',
  },
  status: {
    type: String,
    enum: ['New', 'Under Review', 'In Progress', 'Resolved', 'Rejected'],
    default: 'New',
  },
  anonymous: {
    type: Boolean,
    default: false,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

feedbackSchema.index({ userId: 1, createdAt: -1 });
feedbackSchema.index({ status: 1, category: 1, createdAt: -1 });

export const Feedback = mongoose.model('Feedback', feedbackSchema);
