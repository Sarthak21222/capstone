// server/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const admin = await Admin.findOne({ where: { email } });

    // Plain text check for development
    if (admin && admin.password === password) {
      // The frontend App.js looks for this specific 'token' and 'success'
      res.json({ 
        success: true, 
        token: 'dev-access-token',
        user: { name: admin.full_name, email: admin.email } 
      });
    } else {
      res.status(401).json({ success: false, message: "Invalid Admin Credentials" });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;