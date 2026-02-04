// server/routes/auth.js
const express = require('express');
const router = express.Router();
const logActivity = require('../utils/logger');
const User = require('../models/User');

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  // 1. Find User
  const user = await User.findOne({ where: { email } });
  
  // 2. Check Password (assuming bcrypt is used)
  if (user && password === user.password) { 
    
    // --- THE TRIGGER ---
    await logActivity(user.user_id, user.name, 'Login');
    
    // Update last_login time
    await User.update({ last_login: new Date() }, { where: { user_id: user.user_id } });

    res.json({ success: true, user });
  } else {
    res.status(401).json({ message: "Invalid Credentials" });
  }
});

module.exports = router;