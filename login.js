const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { db } = require('./config'); // Use correct db object

const router = express.Router();

router.post('/', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  db.get(`SELECT id, email, password_hash, role FROM Users WHERE email = ?`, [email], async (err, user) => {
    if (err) {
      console.error('❌ Database error:', err.message);
      return res.status(500).json({ error: 'Database error' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    try {
      const passwordMatch = await bcrypt.compare(password, user.password_hash);
      if (!passwordMatch) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Tokens
      const accessToken = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
      );

      const refreshToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Create Tokens table if it doesn't exist
      db.run(`
        CREATE TABLE IF NOT EXISTS Tokens (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          token TEXT NOT NULL,
          expires_at TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(user_id) REFERENCES Users(id)
        )
      `);

      // Store refresh token
      db.run(
        `INSERT INTO Tokens (user_id, token, expires_at) VALUES (?, ?, ?)`,
        [user.id, refreshToken, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()],
        (err) => {
          if (err) {
            console.error('❌ Token save error:', err.message);
            return res.status(500).json({ error: 'Failed to store refresh token' });
          }

          res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'Strict'
          });

          res.json({ accessToken });
        }
      );

    } catch (err) {
      console.error('❌ Authentication error:', err.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
});

module.exports = router;
