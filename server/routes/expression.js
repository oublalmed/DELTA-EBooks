import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import db from '../db.js';

const router = Router();

// Get all expression entries for the user
router.get('/', requireAuth, async (req, res) => {
  try {
    const entries = await db.all(
      'SELECT * FROM expression_entries WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(entries);
  } catch (err) {
    console.error('Failed to get expression entries:', err);
    res.status(500).json({ error: 'Failed to retrieve expression entries.' });
  }
});

// Add a new expression entry
router.post('/', requireAuth, async (req, res) => {
  const { text, category, mood } = req.body;
  if (!text || !category) {
    return res.status(400).json({ error: 'Text and category are required.' });
  }

  try {
    const result = await db.run(
      'INSERT INTO expression_entries (user_id, text, category, mood) VALUES (?, ?, ?, ?)',
      [req.user.id, text, category, mood]
    );

    const newEntry = await db.get('SELECT * FROM expression_entries WHERE id = ?', [result.insertId]);
    res.status(201).json(newEntry);
  } catch (err) {
    console.error('Failed to add expression entry:', err);
    res.status(500).json({ error: 'Failed to save expression entry.' });
  }
});

// Delete an expression entry
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const result = await db.run(
      'DELETE FROM expression_entries WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Entry not found or you do not have permission to delete it.' });
    }
    res.status(204).send();
  } catch (err) {
    console.error('Failed to delete expression entry:', err);
    res.status(500).json({ error: 'Failed to delete expression entry.' });
  }
});

export default router;
