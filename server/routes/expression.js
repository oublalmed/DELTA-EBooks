import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import db from '../db.js';

const router = Router();

// Get all expression entries for the user
router.get('/', requireAuth, (req, res) => {
  try {
    const entries = db.prepare('SELECT * FROM expression_entries WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
    res.json(entries);
  } catch (err) {
    console.error('Failed to get expression entries:', err);
    res.status(500).json({ error: 'Failed to retrieve expression entries.' });
  }
});

// Add a new expression entry
router.post('/', requireAuth, (req, res) => {
  const { text, category, mood } = req.body;
  if (!text || !category) {
    return res.status(400).json({ error: 'Text and category are required.' });
  }

  try {
    const result = db.prepare(
      'INSERT INTO expression_entries (user_id, text, category, mood) VALUES (?, ?, ?, ?)'
    ).run(req.user.id, text, category, mood);

    const newEntry = db.prepare('SELECT * FROM expression_entries WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newEntry);
  } catch (err) {
    console.error('Failed to add expression entry:', err);
    res.status(500).json({ error: 'Failed to save expression entry.' });
  }
});

// Delete an expression entry
router.delete('/:id', requireAuth, (req, res) => {
  try {
    const result = db.prepare('DELETE FROM expression_entries WHERE id = ? AND user_id = ?').run(req.params.id, req.user.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Entry not found or you do not have permission to delete it.' });
    }
    res.status(204).send();
  } catch (err) {
    console.error('Failed to delete expression entry:', err);
    res.status(500).json({ error: 'Failed to delete expression entry.' });
  }
});

export default router;
