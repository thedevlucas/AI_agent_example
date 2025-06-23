import express from 'express';
import { pool } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get all chats for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [chats] = await pool.execute(
      'SELECT id, title, created_at, last_active_at FROM chats WHERE user_id = ? ORDER BY last_active_at DESC',
      [req.user.id]
    );

    res.json(chats);
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get specific chat
router.get('/:chatId', authenticateToken, async (req, res) => {
  try {
    const { chatId } = req.params;

    const [chats] = await pool.execute(
      'SELECT id, title, created_at, last_active_at FROM chats WHERE id = ? AND user_id = ?',
      [chatId, req.user.id]
    );

    if (chats.length === 0) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    res.json(chats[0]);
  } catch (error) {
    console.error('Get chat error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new chat
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title = 'New Chat' } = req.body;

    const [result] = await pool.execute(
      'INSERT INTO chats (user_id, title) VALUES (?, ?)',
      [req.user.id, title]
    );

    // Log new chat creation
    await pool.execute(
      'INSERT INTO user_logs (user_id, event_type, metadata) VALUES (?, ?, ?)',
      [req.user.id, 'new_chat', JSON.stringify({ chatId: result.insertId })]
    );

    // Create session entry
    await pool.execute(
      'INSERT INTO sessions (chat_id) VALUES (?)',
      [result.insertId]
    );

    const [newChat] = await pool.execute(
      'SELECT id, title, created_at, last_active_at FROM chats WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(newChat[0]);
  } catch (error) {
    console.error('Create chat error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update chat title
router.put('/:chatId', authenticateToken, async (req, res) => {
  try {
    const { chatId } = req.params;
    const { title } = req.body;

    // Verify chat ownership
    const [chats] = await pool.execute(
      'SELECT id FROM chats WHERE id = ? AND user_id = ?',
      [chatId, req.user.id]
    );

    if (chats.length === 0) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    await pool.execute(
      'UPDATE chats SET title = ?, last_active_at = CURRENT_TIMESTAMP WHERE id = ?',
      [title, chatId]
    );

    res.json({ message: 'Chat updated successfully' });
  } catch (error) {
    console.error('Update chat error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete chat
router.delete('/:chatId', authenticateToken, async (req, res) => {
  try {
    const { chatId } = req.params;

    // Verify chat ownership
    const [chats] = await pool.execute(
      'SELECT id FROM chats WHERE id = ? AND user_id = ?',
      [chatId, req.user.id]
    );

    if (chats.length === 0) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    await pool.execute('DELETE FROM chats WHERE id = ?', [chatId]);

    res.json({ message: 'Chat deleted successfully' });
  } catch (error) {
    console.error('Delete chat error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;