const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const crypto = require('crypto'); 
const app = express();

app.use(cors());
app.use(express.json());

// --- ENCRYPTION CONFIGURATION ---
const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = Buffer.from('12345678901234567890123456789012'); 
const IV_LENGTH = 16;

function encrypt(text) {
    if (!text || text === 'N/A' || text.toString().includes(':')) return text;
    let iv = crypto.randomBytes(IV_LENGTH);
    let cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
    let encrypted = cipher.update(text.toString());
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
    if (!text || text === 'N/A' || !text.toString().includes(':')) return text;
    try {
        let textParts = text.split(':');
        let iv = Buffer.from(textParts.shift(), 'hex');
        let encryptedText = Buffer.from(textParts.join(':'), 'hex');
        let decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
        let decrypted = decipher.update(encryptedText);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
        return decrypted.toString();
    } catch (e) { return text; }
}

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

// --- 0. DATA MIGRATION ROUTE ---
app.get('/api/admin/migrate-data', (req, res) => {
    db.query("SELECT * FROM users", (err, users) => {
        users.forEach(u => db.query("UPDATE users SET email=?, password=?, transaction_id=? WHERE user_id=?", [encrypt(u.email), encrypt(u.password), encrypt(u.transaction_id), u.user_id]));
    });
    db.query("SELECT * FROM chat_history", (err, chats) => {
        chats.forEach(c => db.query("UPDATE chat_history SET message=?, response=? WHERE chat_id=?", [encrypt(c.message), encrypt(c.response), c.chat_id]));
    });
    db.query("SELECT * FROM admins", (err, admins) => {
        admins.forEach(a => db.query("UPDATE admins SET email=?, password=? WHERE admin_id=?", [encrypt(a.email), encrypt(a.password), a.admin_id]));
    });
    db.query("SELECT * FROM tickets", (err, tickets) => {
        tickets.forEach(t => db.query("UPDATE tickets SET user_email=?, message=? WHERE ticket_id=?", [encrypt(t.user_email), encrypt(t.message), t.ticket_id]));
    });
    res.send("Migration complete!");
});

// --- 1. AUTHENTICATION ---
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  db.query("SELECT * FROM admins", (err, data) => {
    if (err) return res.status(500).json({ error: err.message });
    const admin = data.find(a => decrypt(a.email) === email && decrypt(a.password) === password);
    if (admin) return res.json({ success: true, admin: { ...admin, email: decrypt(admin.email) } });
    res.status(401).json({ success: false, message: "Invalid Credentials" });
  });
});

// --- 2. USER MANAGEMENT & DETAILS ---
app.get('/api/users/:id/details', (req, res) => {
  const userId = req.params.id;
  const userSql = `SELECT user_id, name, email, plan, IFNULL(used_tokens, 0) as used_tokens, IFNULL(transaction_id, 'N/A') as transaction_id, ban_until FROM users WHERE user_id = ?`;
  const chatSql = `SELECT message, IFNULL(response, 'No response recorded') as response, created_at FROM chat_history WHERE user_id = ? ORDER BY created_at DESC`;

  db.query(userSql, [userId], (err, userData) => {
    if (err) return res.status(500).json({ error: "Database error" });
    if (userData.length === 0) return res.status(404).json({ message: "User not found" });
    db.query(chatSql, [userId], (err, chatData) => {
      const u = userData[0];
      res.json({
        user: { ...u, email: decrypt(u.email), transaction_id: decrypt(u.transaction_id) },
        chats: (chatData || []).map(c => ({ ...c, message: decrypt(c.message), response: decrypt(c.response) }))
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

  db.query("SELECT COUNT(*) as total FROM users WHERE name LIKE ?", [searchQuery], (err, countResult) => {
    if (err) return res.status(500).json({ error: err.message });
    const totalPages = Math.ceil(countResult[0].total / limit) || 1;
    db.query("SELECT * FROM users WHERE name LIKE ? LIMIT ? OFFSET ?", [searchQuery, limit, offset], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      const decrypted = results.map(u => ({ ...u, email: decrypt(u.email), password: decrypt(u.password), transaction_id: decrypt(u.transaction_id) }));
      res.json({ users: decrypted, totalPages: totalPages, currentPage: page });
    });
  });
});

app.post('/api/users', (req, res) => {
  const { name, email, plan, password } = req.body;
  const transId = plan === 'premium' ? 'TRX-' + Math.random().toString(36).substr(2, 9).toUpperCase() : 'N/A';
  const q = "INSERT INTO users (name, email, plan, password, used_tokens, transaction_id) VALUES (?, ?, ?, ?, 0, ?)";
  db.query(q, [name, encrypt(email), plan, encrypt(password), encrypt(transId)], (err) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true, message: "User added successfully" });
  });
});

app.put('/api/users/:id', (req, res) => {
  const { name, email, plan } = req.body;
  const q = "UPDATE users SET name = ?, email = ?, plan = ? WHERE user_id = ?";
  db.query(q, [name, encrypt(email), plan, req.params.id], (err) => {
    if (err) return res.status(500).json({ success: false, error: err.message });
    res.json({ success: true, message: "User updated successfully" });
  });
});

app.delete('/api/users/:id', (req, res) => {
  db.query("DELETE FROM chat_history WHERE user_id = ?", [req.params.id], () => {
    db.query("DELETE FROM users WHERE user_id = ?", [req.params.id], (err) => {
      if (err) return res.status(500).json({ success: false, error: err.message });
      res.json({ success: true, message: "User deleted" });
    });
  });
});

// --- SUBSCRIPTIONS ROUTE (UPDATED FOR ENCRYPTION) ---
app.get('/api/subscriptions', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const search = (req.query.search || '').toLowerCase(); 
  const limit = 10;

  // 1. Fetch ALL premium users to perform decryption-based search
  db.query("SELECT * FROM users WHERE plan = 'premium'", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    // 2. Decrypt and Filter by Name OR Email in memory
    const filteredUsers = results.map(u => ({
      ...u,
      email: decrypt(u.email),
      transaction_id: decrypt(u.transaction_id)
    })).filter(u => 
      u.name.toLowerCase().includes(search) || 
      u.email.toLowerCase().includes(search)
    );

    // 3. Manually handle pagination on the filtered results
    const totalPages = Math.ceil(filteredUsers.length / limit) || 1;
    const offset = (page - 1) * limit;
    const paginatedUsers = filteredUsers.slice(offset, offset + limit);

    res.json({ 
      subscriptions: paginatedUsers, 
      totalPages: totalPages, 
      currentPage: page 
    });
  });
});

// --- 4. SUPPORT TICKETS ---
app.get('/api/tickets', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 8; 
  const offset = (page - 1) * limit;
  db.query("SELECT COUNT(*) as total FROM tickets", (err, countResult) => {
    if (err) return res.status(500).json({ error: err.message });
    const totalPages = Math.ceil(countResult[0].total / limit) || 1;
    db.query("SELECT * FROM tickets ORDER BY ticket_id DESC LIMIT ? OFFSET ?", [limit, offset], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      const decrypted = results.map(t => ({ ...t, user_email: decrypt(t.user_email), message: decrypt(t.message) }));
      res.json({ tickets: decrypted, totalPages: totalPages, currentPage: page });
    });
  });
});

app.put('/api/tickets/close/:id', (req, res) => {
  db.query("UPDATE tickets SET status = 'closed' WHERE ticket_id = ?", [req.params.id], (err) => {
    if (err) return res.status(500).json({ error: "Database error" });
    res.json({ success: true });
  });
});

// --- 5. STATS SUMMARY ---
app.get('/api/stats/summary', (req, res) => {
  const q = `SELECT (SELECT COUNT(*) FROM users WHERE plan = 'premium') as premiumCount, (SELECT COUNT(*) FROM users WHERE plan = 'basic') as basicCount, (SELECT COUNT(*) FROM users) as totalUsers`;
  db.query(q, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    const stats = results[0];
    res.json({ premiumCount: stats.premiumCount, basicCount: stats.basicCount, revenue: stats.premiumCount * 19 });
  });
});

// --- 6. ACTIVITY LOGS ---
app.get('/api/stats/activity', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 5; 
  const offset = (page - 1) * limit;
  db.query("SELECT COUNT(*) as total FROM users WHERE last_login IS NOT NULL", (err, countResult) => {
    if (err) return res.status(500).json({ error: err.message });
    const totalPages = Math.ceil(countResult[0].total / limit) || 1;
    db.query(`SELECT user_id, 'Login' as action, last_login as time FROM users WHERE last_login IS NOT NULL ORDER BY last_login DESC LIMIT ? OFFSET ?`, [limit, offset], (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ logs: results, totalPages: totalPages, currentPage: page });
    });
  });
});

// --- 7. ADMIN & BAN ---
app.put('/api/admin/reset-password', (req, res) => {
  db.query("UPDATE admins SET password = ? WHERE admin_id = 2", [encrypt(req.body.newPassword)], (err) => {
    if (err) return res.status(500).json({ success: false });
    res.json({ success: true });
  });
});

// FIXED: Banning by ID
app.post('/api/users/ban', (req, res) => {
  const { userId, days } = req.body; 
  const q = "UPDATE users SET ban_until = DATE_ADD(NOW(), INTERVAL ? DAY) WHERE user_id = ?";
  db.query(q, [days, userId], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: "User ID not found" });
    res.json({ success: true, message: "User banned successfully" });
  });
});

app.post('/api/users/unban/:id', (req, res) => {
  db.query("UPDATE users SET ban_until = NULL WHERE user_id = ?", [req.params.id], (err) => {
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


// search bar fix
app.get('/api/subscriptions', (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const search = (req.query.search || '').toLowerCase(); 
  const limit = 10;

  db.query("SELECT * FROM users WHERE plan = 'premium'", (err, results) => {
    if (err) return res.status(500).json({ error: err.message });

    const filteredUsers = results.map(u => ({
      ...u,
      email: decrypt(u.email),
      transaction_id: decrypt(u.transaction_id)
    })).filter(u => 
      u.name.toLowerCase().includes(search) || 
      u.email.toLowerCase().includes(search)
    );

    const totalPages = Math.ceil(filteredUsers.length / limit) || 1;
    const offset = (page - 1) * limit;
    const paginatedUsers = filteredUsers.slice(offset, offset + limit);

    res.json({ 
      subscriptions: paginatedUsers, 
      totalPages: totalPages, 
      currentPage: page 
    });
  });
});
app.listen(5000, () => console.log('Backend running on http://localhost:5000'));