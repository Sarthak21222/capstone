// server/routes/logRoutes.js
const express = require('express');
const router = express.Router();
const ActivityLog = require('../models/ActivityLog');
const { Op } = require('sequelize');

router.get('/activity-logs', async (req, res) => {
  try {
    const { search } = req.query;
    
    // Filter by username if a search query exists
    const whereCondition = search 
      ? { user_name: { [Op.like]: `%${search}%` } } 
      : {};

    const logs = await ActivityLog.findAll({
      where: whereCondition,
      order: [['timestamp', 'DESC']], // Newest logs first
      limit: 50 // Keep it fast
    });

    res.json(logs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;