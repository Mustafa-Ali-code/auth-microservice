const express = require('express');
const bcrypt = require('bcrypt');
const { db } = require('./config');

const router = express.Router();

router.post('/', async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const validRoles = ['user', 'admin'];
  const assignedRole = validRoles.includes(role) ? role : 'user';

  try {
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create Users table if it doesn't exist (safe to run every time)
    db.run(`
      CREATE TABLE IF NOT EXISTS Users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(
      `INSERT INTO Users (email, password_hash, role) VALUES (?, ?, ?)`,
      [email, passwordHash, assignedRole],
      function (err) {
        if (err) {
          console.error('❌ Registration error:', err.message);
          return res.status(500).json({ error: 'Email already exists or database error' });
        }

        res.status(201).json({ message: 'User registered successfully' });
      }
    );
  } catch (err) {
    console.error('❌ Registration error (unexpected):', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
