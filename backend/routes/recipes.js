const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all recipes with details
router.get('/', async (req, res) => {
  try {
    const [recipes] = await db.query(`
      SELECT r.*, u.username as author_name, c.name as category_name, cu.name as cuisine_name
      FROM recipes r
      LEFT JOIN users u ON r.author_id = u.id
      LEFT JOIN categories c ON r.category_id = c.id
      LEFT JOIN cuisines cu ON r.cuisine_id = cu.id
      ORDER BY r.created_at DESC
    `);
    
    // Get ingredients and instructions for each recipe
    for (let recipe of recipes) {
      const [ingredients] = await db.query(`
        SELECT i.name, ri.quantity, ri.unit
        FROM recipe_ingredients ri
        JOIN ingredients i ON ri.ingredient_id = i.id
        WHERE ri.recipe_id = ?
        ORDER BY ri.id
      `, [recipe.id]);
      
      const [instructions] = await db.query(`
        SELECT step_number, description
        FROM instructions
        WHERE recipe_id = ?
        ORDER BY step_number
      `, [recipe.id]);
      
      const [tags] = await db.query(`
        SELECT t.name
        FROM recipe_tags rt
        JOIN tags t ON rt.tag_id = t.id
        WHERE rt.recipe_id = ?
      `, [recipe.id]);
      
      recipe.ingredients = ingredients;
      recipe.instructions = instructions;
      recipe.tags = tags.map(t => t.name);
    }
    
    res.json(recipes);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
});

// Get single recipe by ID
router.get('/:id', async (req, res) => {
  try {
    const [recipes] = await db.query(`
      SELECT r.*, u.username as author_name, c.name as category_name, cu.name as cuisine_name
      FROM recipes r
      LEFT JOIN users u ON r.author_id = u.id
      LEFT JOIN categories c ON r.category_id = c.id
      LEFT JOIN cuisines cu ON r.cuisine_id = cu.id
      WHERE r.id = ?
    `, [req.params.id]);
    
    if (recipes.length === 0) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    
    const recipe = recipes[0];
    
    // Get ingredients
    const [ingredients] = await db.query(`
      SELECT i.id, i.name, ri.quantity, ri.unit
      FROM recipe_ingredients ri
      JOIN ingredients i ON ri.ingredient_id = i.id
      WHERE ri.recipe_id = ?
      ORDER BY ri.id
    `, [recipe.id]);
    
    // Get instructions
    const [instructions] = await db.query(`
      SELECT step_number, description
      FROM instructions
      WHERE recipe_id = ?
      ORDER BY step_number
    `, [recipe.id]);
    
    // Get tags
    const [tags] = await db.query(`
      SELECT t.id, t.name
      FROM recipe_tags rt
      JOIN tags t ON rt.tag_id = t.id
      WHERE rt.recipe_id = ?
    `, [recipe.id]);
    
    recipe.ingredients = ingredients;
    recipe.instructions = instructions;
    recipe.tags = tags;
    
    res.json(recipe);
  } catch (error) {
    console.error('Error fetching recipe:', error);
    res.status(500).json({ error: 'Failed to fetch recipe' });
  }
});

// Create new recipe
router.post('/', async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    const { title, description, servings, prep_time_minutes, cook_time_minutes, 
            author_id, category_id, cuisine_id, ingredients, instructions, tags } = req.body;
    
    // Insert recipe
    const [result] = await connection.query(`
      INSERT INTO recipes (title, description, servings, prep_time_minutes, cook_time_minutes, 
                          author_id, category_id, cuisine_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [title, description, servings, prep_time_minutes, cook_time_minutes, 
        author_id, category_id, cuisine_id]);
    
    const recipeId = result.insertId;
    
    // Insert ingredients
    if (ingredients && ingredients.length > 0) {
      for (const ing of ingredients) {
        // Check if ingredient exists, if not create it
        let [ingRows] = await connection.query('SELECT id FROM ingredients WHERE name = ?', [ing.name]);
        let ingredientId;
        
        if (ingRows.length === 0) {
          const [ingResult] = await connection.query('INSERT INTO ingredients (name) VALUES (?)', [ing.name]);
          ingredientId = ingResult.insertId;
        } else {
          ingredientId = ingRows[0].id;
        }
        
        await connection.query(`
          INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
          VALUES (?, ?, ?, ?)
        `, [recipeId, ingredientId, ing.quantity || null, ing.unit || null]);
      }
    }
    
    // Insert instructions
    if (instructions && instructions.length > 0) {
      for (const inst of instructions) {
        await connection.query(`
          INSERT INTO instructions (recipe_id, step_number, description)
          VALUES (?, ?, ?)
        `, [recipeId, inst.step_number, inst.description]);
      }
    }
    
    // Insert tags
    if (tags && tags.length > 0) {
      for (const tagName of tags) {
        // Check if tag exists, if not create it
        let [tagRows] = await connection.query('SELECT id FROM tags WHERE name = ?', [tagName]);
        let tagId;
        
        if (tagRows.length === 0) {
          const [tagResult] = await connection.query('INSERT INTO tags (name) VALUES (?)', [tagName]);
          tagId = tagResult.insertId;
        } else {
          tagId = tagRows[0].id;
        }
        
        await connection.query('INSERT INTO recipe_tags (recipe_id, tag_id) VALUES (?, ?)', [recipeId, tagId]);
      }
    }
    
    await connection.commit();
    res.status(201).json({ message: 'Recipe created successfully', id: recipeId });
  } catch (error) {
    await connection.rollback();
    console.error('Error creating recipe:', error);
    res.status(500).json({ error: 'Failed to create recipe' });
  } finally {
    connection.release();
  }
});

// Update recipe
router.put('/:id', async (req, res) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    
    const { title, description, servings, prep_time_minutes, cook_time_minutes, 
            category_id, cuisine_id, ingredients, instructions, tags } = req.body;
    
    // Update recipe
    await connection.query(`
      UPDATE recipes 
      SET title = ?, description = ?, servings = ?, prep_time_minutes = ?, 
          cook_time_minutes = ?, category_id = ?, cuisine_id = ?
      WHERE id = ?
    `, [title, description, servings, prep_time_minutes, cook_time_minutes, 
        category_id, cuisine_id, req.params.id]);
    
    // Delete existing ingredients, instructions, and tags
    await connection.query('DELETE FROM recipe_ingredients WHERE recipe_id = ?', [req.params.id]);
    await connection.query('DELETE FROM instructions WHERE recipe_id = ?', [req.params.id]);
    await connection.query('DELETE FROM recipe_tags WHERE recipe_id = ?', [req.params.id]);
    
    // Re-insert ingredients
    if (ingredients && ingredients.length > 0) {
      for (const ing of ingredients) {
        let [ingRows] = await connection.query('SELECT id FROM ingredients WHERE name = ?', [ing.name]);
        let ingredientId;
        
        if (ingRows.length === 0) {
          const [ingResult] = await connection.query('INSERT INTO ingredients (name) VALUES (?)', [ing.name]);
          ingredientId = ingResult.insertId;
        } else {
          ingredientId = ingRows[0].id;
        }
        
        await connection.query(`
          INSERT INTO recipe_ingredients (recipe_id, ingredient_id, quantity, unit)
          VALUES (?, ?, ?, ?)
        `, [req.params.id, ingredientId, ing.quantity || null, ing.unit || null]);
      }
    }
    
    // Re-insert instructions
    if (instructions && instructions.length > 0) {
      for (const inst of instructions) {
        await connection.query(`
          INSERT INTO instructions (recipe_id, step_number, description)
          VALUES (?, ?, ?)
        `, [req.params.id, inst.step_number, inst.description]);
      }
    }
    
    // Re-insert tags
    if (tags && tags.length > 0) {
      for (const tagName of tags) {
        let [tagRows] = await connection.query('SELECT id FROM tags WHERE name = ?', [tagName]);
        let tagId;
        
        if (tagRows.length === 0) {
          const [tagResult] = await connection.query('INSERT INTO tags (name) VALUES (?)', [tagName]);
          tagId = tagResult.insertId;
        } else {
          tagId = tagRows[0].id;
        }
        
        await connection.query('INSERT INTO recipe_tags (recipe_id, tag_id) VALUES (?, ?)', [req.params.id, tagId]);
      }
    }
    
    await connection.commit();
    res.json({ message: 'Recipe updated successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error updating recipe:', error);
    res.status(500).json({ error: 'Failed to update recipe' });
  } finally {
    connection.release();
  }
});

// Delete recipe
router.delete('/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM recipes WHERE id = ?', [req.params.id]);
    res.json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    res.status(500).json({ error: 'Failed to delete recipe' });
  }
});

module.exports = router;

