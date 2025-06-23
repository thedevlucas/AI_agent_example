import express from 'express';
import bcrypt from 'bcryptjs';
import { pool } from '../config/database.js';

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email, username]
    );

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const [result] = await pool.execute(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, passwordHash]
    );

    await pool.execute(
      'INSERT INTO user_logs (user_id, event_type, metadata) VALUES (?, ?, ?)',
      [result.insertId, 'register', JSON.stringify({ email, username })]
    );

    // Create session
    req.session.user = {
      id: result.insertId,
      username,
      email,
      rank: "user"
    };

    res.status(201).json({
      message: 'User registered successfully',
      user: req.session.user
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const [users] = await pool.execute(
      'SELECT id, username, email, password_hash, rank FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    await pool.execute(
      'INSERT INTO user_logs (user_id, event_type, metadata) VALUES (?, ?, ?)',
      [user.id, 'login', JSON.stringify({ email })]
    );

    // Create session
    req.session.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      rank: user.rank
    };

    res.json({
      message: 'Login successful',
      user: req.session.user
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user
router.get('/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json({ user: req.session.user });
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    const user = req.session.user;

    if (user) {
      await pool.execute(
        'INSERT INTO user_logs (user_id, event_type) VALUES (?, ?)',
        [user.id, 'logout']
      );
    }

    req.session.destroy(err => {
      if (err) {
        console.error('Logout error:', err);
        return res.status(500).json({ error: 'Could not log out' });
      }
      res.clearCookie('connect.sid');
      res.json({ message: 'Logout successful' });
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;