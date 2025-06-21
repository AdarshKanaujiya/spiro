import VideoProgress from '../model/videoProgressModel.js';

// Update video progress
export const updateProgress = async (req, res) => {
  try {
    const { courseId, lectureId, progress, lastPosition } = req.body;
    const userId = req.userId;

    console.log('📊 Updating progress:', { userId, courseId, lectureId, progress, lastPosition });

    if (!userId || !courseId || !lectureId) {
      console.log('❌ Missing required fields:', { userId, courseId, lectureId });
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // Validate progress and lastPosition
    if (typeof progress !== 'number' || typeof lastPosition !== 'number') {
      console.log('❌ Invalid data types:', { progress: typeof progress, lastPosition: typeof lastPosition });
      return res.status(400).json({
        success: false,
        message: 'Progress and lastPosition must be numbers'
      });
    }

    const progressData = await VideoProgress.findOneAndUpdate(
      { userId, courseId, lectureId },
      {
        progress: Math.max(0, Math.min(100, progress)), // Ensure progress is between 0-100
        lastPosition: Math.max(0, lastPosition), // Ensure lastPosition is not negative
        lastUpdated: new Date()
      },
      { upsert: true, new: true }
    );

    console.log('✅ Progress updated successfully:', progressData);

    res.status(200).json({
      success: true,
      data: progressData,
      message: 'Progress updated successfully'
    });
  } catch (error) {
    console.error('❌ Error updating video progress:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating video progress',
      error: error.message
    });
  }
};

// Get video progress
export const getProgress = async (req, res) => {
  try {
    const { courseId, lectureId } = req.params;
    const userId = req.userId;

    console.log('📥 Getting progress for:', { userId, courseId, lectureId });

    if (!userId || !courseId || !lectureId) {
      console.log('❌ Missing required fields:', { userId, courseId, lectureId });
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    const progressData = await VideoProgress.findOne({
      userId,
      courseId,
      lectureId
    });

    console.log('📊 Found progress data:', progressData);

    res.status(200).json({
      success: true,
      data: progressData || { progress: 0, lastPosition: 0 },
      message: 'Progress retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error getting video progress:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting video progress',
      error: error.message
    });
  }
};

// Get all progress for a user (optional - for debugging)
export const getAllProgress = async (req, res) => {
  try {
    const userId = req.userId;

    console.log('📥 Getting all progress for user:', userId);

    const allProgress = await VideoProgress.find({ userId }).sort({ lastUpdated: -1 });

    console.log('📊 Found progress entries:', allProgress.length);

    res.status(200).json({
      success: true,
      data: allProgress,
      message: 'All progress retrieved successfully'
    });
  } catch (error) {
    console.error('❌ Error getting all progress:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting all progress',
      error: error.message
    });
  }
};