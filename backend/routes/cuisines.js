const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all cuisines
router.get('/', async (req, res) => {
  try {
    const [cuisines] = await db.query('SELECT * FROM cuisines ORDER BY name');
    res.json(cuisines);
  } catch (error) {
    console.error('Error fetching cuisines:', error);
    res.status(500).json({ error: 'Failed to fetch cuisines' });
  }
});

// Create cuisine
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    const [result] = await db.query('INSERT INTO cuisines (name) VALUES (?)', [name]);
    res.status(201).json({ message: 'Cuisine created successfully', id: result.insertId });
  } catch (error) {
    console.error('Error creating cuisine:', error);
    res.status(500).json({ error: 'Failed to create cuisine' });
  }
});

// Update cuisine
router.put('/:id', async (req, res) => {
  try {
    const { name } = req.body;
    await db.query('UPDATE cuisines SET name = ? WHERE id = ?', [name, req.params.id]);
    res.json({ message: 'Cuisine updated successfully' });
  } catch (error) {
    console.error('Error updating cuisine:', error);
    res.status(500).json({ error: 'Failed to update cuisine' });
  }
});

// Delete cuisine
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM cuisines WHERE id = ?', [req.params.id]);
    res.json({ message: 'Cuisine deleted successfully' });
  } catch (error) {
    console.error('Error deleting cuisine:', error);
    res.status(500).json({ error: 'Failed to delete cuisine' });
  }
});

module.exports = router;

