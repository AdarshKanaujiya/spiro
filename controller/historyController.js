import mongoose from 'mongoose';
import History from '../model/historyModel.js';

// History Schema
// const historySchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   courseId: {
//     type: String,
//     required: true
//   },
//   lectureId: {
//     type: String,
//     required: true
//   },
//   title: {
//     type: String,
//     required: true
//   },
//   thumbnail: {
//     type: String,
//     required: true
//   },
//   duration: {
//     type: String,
//     required: true
//   },
//   watchedAt: {
//     type: Date,
//     default: Date.now
//   }
// });

// Compound index to prevent duplicates and enable efficient queries
// historySchema.index({ userId: 1, courseId: 1, lectureId: 1 }, { unique: true });
// historySchema.index({ userId: 1, watchedAt: -1 });

// const History = mongoose.model('History', historySchema);

// Add video to history
export const addToHistory = async (req, res) => {
  try {
    const { courseId, lectureId, title, thumbnail, duration } = req.body;
    const userId = req.userId;

    console.log('📝 Adding to history:', { userId, courseId, lectureId, title });

    if (!userId || !courseId || !lectureId || !title) {
      console.log('❌ Missing required fields for history');
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Update existing entry or create new one
    const historyEntry = await History.findOneAndUpdate(
      { userId, courseId, lectureId },
      {
        title,
        thumbnail,
        duration,
        watchedAt: new Date()
      },
      { upsert: true, new: true }
    );

    console.log('✅ History entry created/updated:', historyEntry);

    res.status(200).json({
      success: true,
      data: historyEntry,
      message: 'Added to history successfully'
    });
  } catch (error) {
    console.error('❌ Error adding to history:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding to history',
      error: error.message
    });
  }
};

// Get user's watch history
export const getHistory = async (req, res) => {
  try {
    const userId = req.userId;

    console.log('📥 Getting history for user:', userId);

    const allHistory = await History.find({ userId })
      .sort({ watchedAt: -1 })
      .lean();

    console.log('📊 Found history entries:', allHistory.length);

    // Group by time periods
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    const groupedHistory = {
      today: [],
      yesterday: [],
      older: []
    };

    allHistory.forEach(entry => {
      const watchedDate = new Date(entry.watchedAt);
      
      if (watchedDate >= today) {
        groupedHistory.today.push(entry);
      } else if (watchedDate >= yesterday) {
        groupedHistory.yesterday.push(entry);
      } else {
        groupedHistory.older.push(entry);
      }
    });

    console.log('📊 Grouped history:', {
      today: groupedHistory.today.length,
      yesterday: groupedHistory.yesterday.length,
      older: groupedHistory.older.length
    });

    res.status(200).json({
      success: true,
      history: groupedHistory,
      message: 'History retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error getting history:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting history',
      error: error.message
    });
  }
};

// Clear all history
export const clearHistory = async (req, res) => {
  try {
    const userId = req.userId;

    console.log('🗑️ Clearing history for user:', userId);

    const result = await History.deleteMany({ userId });

    console.log('✅ History cleared:', result.deletedCount, 'entries');

    res.status(200).json({
      success: true,
      message: `Cleared ${result.deletedCount} history entries`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('❌ Error clearing history:', error);
    res.status(500).json({
      success: false,
      message: 'Error clearing history',
      error: error.message
    });
  }
};

export default History;