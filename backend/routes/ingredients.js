const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all ingredients with the recipe IDs that use each ingredient
router.get('/', async (req, res) => {
  try {
    const [ingredients] = await db.query(`
      SELECT 
        i.id,
        i.name,
        GROUP_CONCAT(DISTINCT ri.recipe_id ORDER BY ri.recipe_id) AS recipe_ids
      FROM ingredients i
      LEFT JOIN recipe_ingredients ri ON ri.ingredient_id = i.id
      GROUP BY i.id, i.name
      ORDER BY i.name
    `);
    res.json(ingredients);
  } catch (error) {
    console.error('Error fetching ingredients:', error);
    res.status(500).json({ error: 'Failed to fetch ingredients' });
  }
});

// Create ingredient
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    const [result] = await db.query('INSERT INTO ingredients (name) VALUES (?)', [name]);
    res.status(201).json({ message: 'Ingredient created successfully', id: result.insertId });
  } catch (error) {
    console.error('Error creating ingredient:', error);
    res.status(500).json({ error: 'Failed to create ingredient' });
  }
});

// Update ingredient
router.put('/:id', async (req, res) => {
  try {
    const { name } = req.body;
    await db.query('UPDATE ingredients SET name = ? WHERE id = ?', [name, req.params.id]);
    res.json({ message: 'Ingredient updated successfully' });
  } catch (error) {
    console.error('Error updating ingredient:', error);
    res.status(500).json({ error: 'Failed to update ingredient' });
  }
});

// Delete ingredient
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM ingredients WHERE id = ?', [req.params.id]);
    res.json({ message: 'Ingredient deleted successfully' });
  } catch (error) {
    console.error('Error deleting ingredient:', error);
    res.status(500).json({ error: 'Failed to delete ingredient' });
  }
});

module.exports = router;

