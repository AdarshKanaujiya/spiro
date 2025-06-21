import mongoose from 'mongoose';

const videoProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: String,
    required: true
  },
  lectureId: {
    type: String,
    required: true
  },
  progress: {
    type: Number, // Store progress as a percentage (0-100)
    default: 0
  },
  lastPosition: {
    type: Number, // Store last position in seconds
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

// Compound index to ensure one progress entry per user per video
videoProgressSchema.index({ userId: 1, courseId: 1, lectureId: 1 }, { unique: true });

const VideoProgress = mongoose.model('VideoProgress', videoProgressSchema);

export default VideoProgress; 