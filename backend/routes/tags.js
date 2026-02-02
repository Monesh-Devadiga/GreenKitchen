const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all tags with the recipe IDs that use each tag
router.get('/', async (req, res) => {
  try {
    const [tags] = await db.query(`
      SELECT 
        t.id,
        t.name,
        GROUP_CONCAT(DISTINCT rt.recipe_id ORDER BY rt.recipe_id) AS recipe_ids
      FROM tags t
      LEFT JOIN recipe_tags rt ON rt.tag_id = t.id
      GROUP BY t.id, t.name
      ORDER BY t.name
    `);
    res.json(tags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

// Create tag
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    const [result] = await db.query('INSERT INTO tags (name) VALUES (?)', [name]);
    res.status(201).json({ message: 'Tag created successfully', id: result.insertId });
  } catch (error) {
    console.error('Error creating tag:', error);
    res.status(500).json({ error: 'Failed to create tag' });
  }
});

// Update tag
router.put('/:id', async (req, res) => {
  try {
    const { name } = req.body;
    await db.query('UPDATE tags SET name = ? WHERE id = ?', [name, req.params.id]);
    res.json({ message: 'Tag updated successfully' });
  } catch (error) {
    console.error('Error updating tag:', error);
    res.status(500).json({ error: 'Failed to update tag' });
  }
});

// Update which recipes are associated with a tag
router.put('/:id/recipes', async (req, res) => {
  const connection = await db.getConnection();
  try {
    const tagId = req.params.id;
    const { recipe_ids } = req.body; // expected array of recipe IDs

    await connection.beginTransaction();

    // Clear existing relationships
    await connection.query('DELETE FROM recipe_tags WHERE tag_id = ?', [tagId]);

    if (Array.isArray(recipe_ids) && recipe_ids.length > 0) {
      for (const recipeId of recipe_ids) {
        if (!recipeId) continue;
        await connection.query(
          'INSERT IGNORE INTO recipe_tags (recipe_id, tag_id) VALUES (?, ?)',
          [recipeId, tagId]
        );
      }
    }

    await connection.commit();
    res.json({ message: 'Tag recipes updated successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating tag recipes:', error);
    res.status(500).json({ error: 'Failed to update tag recipes' });
  } finally {
    connection.release();
  }
});

// Delete tag
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM tags WHERE id = ?', [req.params.id]);
    res.json({ message: 'Tag deleted successfully' });
  } catch (error) {
    console.error('Error deleting tag:', error);
    res.status(500).json({ error: 'Failed to delete tag' });
  }
});

// Copy all tags from one recipe to another
router.post('/copy-recipe-tags', async (req, res) => {
  try {
    const { from_recipe_id, to_recipe_id } = req.body;

    if (!from_recipe_id || !to_recipe_id) {
      return res.status(400).json({ error: 'from_recipe_id and to_recipe_id are required' });
    }

    // Get tag ids for source recipe
    const [rows] = await db.query(
      'SELECT tag_id FROM recipe_tags WHERE recipe_id = ?',
      [from_recipe_id]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: 'Source recipe has no tags to copy' });
    }

    // Insert tags for target recipe, ignore duplicates
    for (const row of rows) {
      await db.query(
        'INSERT IGNORE INTO recipe_tags (recipe_id, tag_id) VALUES (?, ?)',
        [to_recipe_id, row.tag_id]
      );
    }

    res.json({ message: 'Tags copied from source recipe to target recipe successfully' });
  } catch (error) {
    console.error('Error copying recipe tags:', error);
    res.status(500).json({ error: 'Failed to copy recipe tags' });
  }
});

module.exports = router;

