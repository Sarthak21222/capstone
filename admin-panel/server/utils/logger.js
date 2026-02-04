const ActivityLog = require('../models/ActivityLog');

const logActivity = async (userId, userName, action) => {
  try {
    await ActivityLog.create({
      user_id: userId,
      user_name: userName,
      action: action
    });
  } catch (error) {
    console.error("Failed to create log:", error);
  }
};

module.exports = logActivity;