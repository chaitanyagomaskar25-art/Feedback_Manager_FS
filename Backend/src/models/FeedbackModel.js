import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  name: {
    type: String,
    required: 'Name should be required',
    trim: true,
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
  },
}, { timestamps: true });

export const Feedback = mongoose.model('Feedback', feedbackSchema);
