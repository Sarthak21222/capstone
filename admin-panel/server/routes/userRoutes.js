const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET all users
router.get('/', async (req, res) => {
  const users = await User.findAll();
  res.json(users);
});

// ADD user
router.post('/add', async (req, res) => {
  try {
    const newUser = await User.create(req.body);
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE user
router.delete('/:id', async (req, res) => {
  await User.destroy({ where: { user_id: req.params.id } });
  res.json({ message: "User deleted" });
});

module.exports = router;
// Ban user until a specific date
router.put('/ban/:id', async (req, res) => {
  const { banDays } = req.body; 
  const banDate = new Date();
  banDate.setDate(banDate.getDate() + parseInt(banDays));

  await User.update({ ban_until: banDate }, { where: { user_id: req.params.id } });
  res.json({ message: `User banned until ${banDate.toDateString()}` });
});

// Unban user
router.put('/unban/:id', async (req, res) => {
  await User.update({ ban_until: null }, { where: { user_id: req.params.id } });
  res.json({ message: "User unbanned" });
});
// server/routes/userRoutes.js
router.get('/all-users', async (req, res) => {
  const users = await User.findAll();
  res.json(users); // This will fill your empty User Management table
});

// server/routes/logRoutes.js
router.get('/all-logs', async (req, res) => {
  const logs = await ActivityLog.findAll({ order: [['timestamp', 'DESC']] });
  res.json(logs); // This will fix "Loading live logs..."
});