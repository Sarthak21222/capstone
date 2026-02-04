const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// MySQL Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'Sarthak@212', 
  database: 'admin_db'    
});

db.connect((err) => {
  if (err) console.error("DB Error: ", err.message);
  else console.log("MySQL Connected Successfully!");
});

// --- 1. AUTHENTICATION ---
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const q = "SELECT * FROM admins WHERE email = ? AND password = ?";
  db.query(q, [email, password], (err, data) => {
    if (err) return res.status(500).json({ error: err.message });
    if (data.length > 0) return res.json({ success: true, admin: data[0] });
    res.status(401).json({ success: false, message: "Invalid Credentials" });
  });
});

// --- 2. USER MANAGEMENT & DETAILS ---

app.get('/api/users/:id/details', (req, res) => {
  const userId = req.params.id;
  
  const userSql = `
    SELECT user_id, name, email, plan, 
    IFNULL(used_tokens, 0) as used_tokens, 
    IFNULL(transaction_id, 'N/A') as transaction_id, 
    ban_until FROM users WHERE user_id = ?`;

  // UPDATED: Added IFNULL to response to prevent empty bubbles
  const chatSql = `
    SELECT message, IFNULL(response, 'No response recorded') as response, created_at 
    FROM chat_history 
    WHERE user_id = ? 
    ORDER BY created_at DESC`;

  db.query(userSql, [userId], (err, userData) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (userData.length === 0) return res.status(404).json({ message: "User not found" });

    db.query(chatSql, [userId], (err, chatData) => {
      res.json({
        user: userData[0],
        chats: (err || !chatData) ? [] : chatData 
      });
    });
  });
});

app.get('/api/users', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const search = req.query.search || ''; 
  const limit = 10; 
  const offset = (page - 1) * limit;
  const searchQuery = `%${search}%`;

  const countSql = "SELECT COUNT(*) as total FROM users WHERE name LIKE ? OR email LIKE ?";
  db.query(countSql, [searchQuery, searchQuery], (err, countResult) => {
    if (err) return res.status(500).json({ error: err.message });
    const totalPages = Math.ceil(countResult[0].total / limit) || 1;
    const dataSql = "SELECT * FROM users WHERE name LIKE ? OR email LIKE ? LIMIT ? OFFSET ?";
    db.query(dataSql, [searchQuery, searchQuery, limit, offset], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ users: results, totalPages: totalPages, currentPage: page });
    });
  });
});

app.post('/api/users', (req, res) => {
  const { name, email, plan, password } = req.body;
  const transId = plan === 'premium' ? 'TRX-' + Math.random().toString(36).substr(2, 9).toUpperCase() : 'N/A';
  const q = "INSERT INTO users (name, email, plan, password, used_tokens, transaction_id) VALUES (?, ?, ?, ?, 0, ?)";
  db.query(q, [name, email, plan, password, transId], (err, result) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true, message: "User added successfully" });
  });
});

app.put('/api/users/:id', (req, res) => {
  const userId = req.params.id;
  const { name, email, plan } = req.body;
  const q = "UPDATE users SET name = ?, email = ?, plan = ? WHERE user_id = ?";
  db.query(q, [name, email, plan, userId], (err, result) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true, message: "User updated successfully" });
  });
});

app.delete('/api/users/:id', (req, res) => {
  const userId = req.params.id;
  const deleteChats = "DELETE FROM chat_history WHERE user_id = ?";
  db.query(deleteChats, [userId], (err) => {
    const deleteUser = "DELETE FROM users WHERE user_id = ?";
    db.query(deleteUser, [userId], (err, result) => {
      if (err) return res.status(500).json({ success: false, error: err.message });
      res.json({ success: true, message: "User and history deleted" });
    });
  });
});

// --- 3. SUBSCRIPTIONS ---
app.get('/api/subscriptions', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const search = req.query.search || ''; 
  const limit = 10;
  const offset = (page - 1) * limit;
  const searchQuery = `%${search}%`;

  const countSql = "SELECT COUNT(*) as total FROM users WHERE plan = 'premium' AND (name LIKE ? OR email LIKE ?)";
  
  db.query(countSql, [searchQuery, searchQuery], (err, countResult) => {
    if (err) return res.status(500).json({ error: err.message });
    const totalPages = Math.ceil(countResult[0].total / limit) || 1;

    const dataSql = `
      SELECT user_id, name, email, IFNULL(transaction_id, 'N/A') as transaction_id, last_login 
      FROM users 
      WHERE plan = 'premium' AND (name LIKE ? OR email LIKE ?) 
      LIMIT ? OFFSET ?`;

    db.query(dataSql, [searchQuery, searchQuery, limit, offset], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ subscriptions: results, totalPages: totalPages, currentPage: page });
    });
  });
});

// --- 4. SUPPORT TICKETS ---
app.get('/api/tickets', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 8; 
  const offset = (page - 1) * limit;
  const countSql = "SELECT COUNT(*) as total FROM tickets";
  db.query(countSql, (err, countResult) => {
    if (err) return res.status(500).json({ error: err.message });
    const totalPages = Math.ceil(countResult[0].total / limit) || 1;
    const dataSql = "SELECT * FROM tickets ORDER BY ticket_id DESC LIMIT ? OFFSET ?";
    db.query(dataSql, [limit, offset], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ tickets: results, totalPages: totalPages, currentPage: page });
    });
  });
});

app.put('/api/tickets/close/:id', (req, res) => {
  const q = "UPDATE tickets SET status = 'closed' WHERE ticket_id = ?"; 
  db.query(q, [req.params.id], (err, result) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ success: true });
  });
});

// --- 5. STATS SUMMARY ---
app.get('/api/stats/summary', (req, res) => {
  const q = `SELECT 
    (SELECT COUNT(*) FROM users WHERE plan = 'premium') as premiumCount,
    (SELECT COUNT(*) FROM users WHERE plan = 'basic') as basicCount,
    (SELECT COUNT(*) FROM users) as totalUsers`;
    
  db.query(q, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    const stats = results[0];
    res.json({ 
      premiumCount: stats.premiumCount, 
      basicCount: stats.basicCount,
      revenue: stats.premiumCount * 19 
    });
  });
});

// --- 6. ACTIVITY LOGS ---
app.get('/api/stats/activity', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 5; 
  const offset = (page - 1) * limit;
  const countSql = "SELECT COUNT(*) as total FROM users WHERE last_login IS NOT NULL";
  db.query(countSql, (err, countResult) => {
    if (err) return res.status(500).json({ error: err.message });
    const totalPages = Math.ceil(countResult[0].total / limit) || 1;
    const dataSql = `SELECT user_id, 'Login' as action, last_login as time FROM users WHERE last_login IS NOT NULL ORDER BY last_login DESC LIMIT ? OFFSET ?`;
    db.query(dataSql, [limit, offset], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ logs: results, totalPages: totalPages, currentPage: page });
    });
  });
});

// --- 7. ADMIN & BAN ---
app.put('/api/admin/reset-password', (req, res) => {
  const { newPassword } = req.body;
  const q = "UPDATE admins SET password = ? WHERE admin_id = 6";
  db.query(q, [newPassword], (err) => {
    if (err) return res.status(500).json({ success: false });
    res.json({ success: true });
  });
});

app.post('/api/users/ban', (req, res) => {
  const { email, days } = req.body;
  const q = "UPDATE users SET ban_until = DATE_ADD(NOW(), INTERVAL ? DAY) WHERE email = ?";
  db.query(q, [days, email], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.post('/api/users/unban/:id', (req, res) => {
  const q = "UPDATE users SET ban_until = NULL WHERE user_id = ?";
  db.query(q, [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

// --- 8. REPORTS & ANALYTICS ---
app.get('/api/reports/analytics', (req, res) => {
  const newUserSql = "SELECT DATE_FORMAT(last_login, '%Y-%m-%d') as date, COUNT(*) as count FROM users GROUP BY date ORDER BY date DESC LIMIT 7";
  const subSalesSql = "SELECT plan, COUNT(*) as count FROM users GROUP BY plan";
  const revenueSql = "SELECT DATE_FORMAT(last_login, '%M') as month, COUNT(*) * 19 as amount FROM users WHERE plan = 'premium' GROUP BY month";

  db.query(newUserSql, (err, userGrowth) => {
    if (err) return res.status(500).json({ error: err.message });
    db.query(subSalesSql, (err, planDist) => {
      if (err) return res.status(500).json({ error: err.message });
      db.query(revenueSql, (err, revenueData) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ userGrowth: userGrowth.reverse(), planDist: planDist, revenueData: revenueData });
      });
    });
  });
});

app.listen(5000, () => console.log('Backend running on http://localhost:5000'));