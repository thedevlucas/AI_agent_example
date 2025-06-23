import { pool } from '../config/database.js';

export const authenticateToken = async (req, res, next) => {
  // Check if user is authenticated via session
  if (!req.session || !req.session.user) {
    return res.status(401).json({ error: 'User not authenticated' });
  }

  try {
    const [users] = await pool.execute(
      'SELECT id, username, email, rank FROM users WHERE id = ?',
      [req.session.user.id]
    );

    if (users.length === 0) {
      // Clear invalid session
      req.session.destroy();
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = users[0];
    next();
  } catch (error) {
    console.error('Session auth error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};