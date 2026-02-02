const express = require('express');
const router = express.Router();
const db = require('../config/database');

// Get all users
router.get('/', async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, username, email, created_at FROM users ORDER BY created_at DESC');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get single user
router.get('/:id', async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, username, email, created_at FROM users WHERE id = ?', [req.params.id]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(users[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user' });
  }
});

// Create user
router.post('/', async (req, res) => {
  try {
    const { username, email, password_hash } = req.body;
    const [result] = await db.query(
      'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
      [username, email, password_hash]
    );
    res.status(201).json({ message: 'User created successfully', id: result.insertId });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  try {
    const { username, email, password_hash } = req.body;
    const updates = [];
    const values = [];
    
    if (username) {
      updates.push('username = ?');
      values.push(username);
    }
    if (email) {
      updates.push('email = ?');
      values.push(email);
    }
    if (password_hash) {
      updates.push('password_hash = ?');
      values.push(password_hash);
    }
    
    values.push(req.params.id);
    await db.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user (and detach their data safely)
router.delete('/:id', async (req, res) => {
  const connection = await db.getConnection();
  try {
    const userId = req.params.id;

    await connection.beginTransaction();

    // Remove this user from reviews
    await connection.query('DELETE FROM reviews WHERE user_id = ?', [userId]);

    // Detach this user as an author from recipes (keep the recipes)
    await connection.query('UPDATE recipes SET author_id = NULL WHERE author_id = ?', [userId]);

    // Finally delete the user
    await connection.query('DELETE FROM users WHERE id = ?', [userId]);

    await connection.commit();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    await connection.rollback();
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  } finally {
    connection.release();
  }
});

module.exports = router;

