const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all reviews
router.get('/', async (req, res) => {
  try {
    const [reviews] = await db.query(`
      SELECT r.*, u.username, rec.title as recipe_title
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      JOIN recipes rec ON r.recipe_id = rec.id
      ORDER BY r.created_at DESC
    `);
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Get reviews for a specific recipe
router.get('/recipe/:recipeId', async (req, res) => {
  try {
    const [reviews] = await db.query(`
      SELECT r.*, u.username
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.recipe_id = ?
      ORDER BY r.created_at DESC
    `, [req.params.recipeId]);
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Create new review
router.post('/', async (req, res) => {
  try {
    const { recipe_id, user_id, rating, comment } = req.body;

    // Prevent users from reviewing their own recipes
    const [recipes] = await db.query('SELECT author_id FROM recipes WHERE id = ?', [recipe_id]);
    if (recipes.length === 0) {
      return res.status(400).json({ error: 'Recipe not found' });
    }

    if (recipes[0].author_id === Number(user_id)) {
      return res.status(400).json({ error: 'You cannot review your own recipe.' });
    }
    
    const [result] = await db.query(`
      INSERT INTO reviews (recipe_id, user_id, rating, comment)
      VALUES (?, ?, ?, ?)
    `, [recipe_id, user_id, rating, comment]);
    
    res.status(201).json({ message: 'Review created successfully', id: result.insertId });
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// Update review
router.put('/:id', async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    await db.query(`
      UPDATE reviews 
      SET rating = ?, comment = ?
      WHERE id = ?
    `, [rating, comment, req.params.id]);
    
    res.json({ message: 'Review updated successfully' });
  } catch (error) {
    console.error('Error updating review:', error);
    res.status(500).json({ error: 'Failed to update review' });
  }
});

// Delete review
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM reviews WHERE id = ?', [req.params.id]);
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Error deleting review:', error);
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

module.exports = router;

