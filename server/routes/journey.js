import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import db from '../db.js';

const router = Router();

// Get all journey entries for the user
router.get('/', requireAuth, async (req, res) => {
  try {
    const entries = await db.prepare('SELECT * FROM journey_entries WHERE user_id = ? ORDER BY date DESC').all(req.user.id);
    res.json(entries);
  } catch (err) {
    console.error('Failed to get journey entries:', err);
    res.status(500).json({ error: 'Failed to retrieve journey entries.' });
  }
});

// Add or update a journey entry
router.post('/', requireAuth, async (req, res) => {
  const { date, emotion, milestone, challenge, reflection, rating } = req.body;
  if (!date || !emotion || !rating) {
    return res.status(400).json({ error: 'Date, emotion, and rating are required.' });
  }

  try {
    // Check if an entry for that date already exists
    const existing = await db.prepare('SELECT id FROM journey_entries WHERE user_id = ? AND date = ?').get(req.user.id, date);

    if (existing) {
      // Update existing entry
      await db.prepare(
        'UPDATE journey_entries SET emotion = ?, milestone = ?, challenge = ?, reflection = ?, rating = ? WHERE id = ?'
      ).run(emotion, milestone, challenge, reflection, rating, existing.id);
      const updatedEntry = await db.prepare('SELECT * FROM journey_entries WHERE id = ?').get(existing.id);
      res.json(updatedEntry);
    } else {
      // Insert new entry
      const result = await db.prepare(
        'INSERT INTO journey_entries (user_id, date, emotion, milestone, challenge, reflection, rating) VALUES (?, ?, ?, ?, ?, ?, ?)'
      ).run(req.user.id, date, emotion, milestone, challenge, reflection, rating);
      const newEntry = await db.prepare('SELECT * FROM journey_entries WHERE id = ?').get(result.lastInsertRowid);
      res.status(201).json(newEntry);
    }
  } catch (err) {
    console.error('Failed to save journey entry:', err);
    res.status(500).json({ error: 'Failed to save journey entry.' });
  }
});

// Delete a journey entry
router.delete('/:date', requireAuth, async (req, res) => {
  try {
    const result = await db.prepare('DELETE FROM journey_entries WHERE date = ? AND user_id = ?').run(req.params.date, req.user.id);
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Entry not found or you do not have permission to delete it.' });
    }
    res.status(204).send();
  } catch (err) {
    console.error('Failed to delete journey entry:', err);
    res.status(500).json({ error: 'Failed to delete journey entry.' });
  }
});

export default router;
