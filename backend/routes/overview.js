const express = require('express');
const router = express.Router();
const db = require('../config/database');

router.get('/', async (_req, res) => {
  try {
    const [recipeSummaries] = await db.query(`
      SELECT r.id,
             r.title,
             u.username AS author,
             c.name AS category,
             cu.name AS cuisine,
             COUNT(DISTINCT rev.id) AS review_count,
             COALESCE(ROUND(AVG(rev.rating), 1), 0) AS avg_rating,
             GROUP_CONCAT(DISTINCT t.name ORDER BY t.name SEPARATOR ', ') AS tags
      FROM recipes r
      LEFT JOIN users u ON r.author_id = u.id
      LEFT JOIN categories c ON r.category_id = c.id
      LEFT JOIN cuisines cu ON r.cuisine_id = cu.id
      LEFT JOIN reviews rev ON rev.recipe_id = r.id
      LEFT JOIN recipe_tags rt ON rt.recipe_id = r.id
      LEFT JOIN tags t ON rt.tag_id = t.id
      GROUP BY r.id
      ORDER BY r.created_at DESC
      LIMIT 25
    `);

    const [recentReviews] = await db.query(`
      SELECT rev.id,
             rev.rating,
             rev.comment,
             rev.created_at,
             u.username,
             r.title AS recipe_title
      FROM reviews rev
      JOIN users u ON rev.user_id = u.id
      JOIN recipes r ON rev.recipe_id = r.id
      ORDER BY rev.created_at DESC
      LIMIT 15
    `);

    const [activeUsers] = await db.query(`
      SELECT u.id,
             u.username,
             u.email,
             COUNT(DISTINCT r.id) AS recipes_created,
             COUNT(DISTINCT rev.id) AS reviews_written
      FROM users u
      LEFT JOIN recipes r ON r.author_id = u.id
      LEFT JOIN reviews rev ON rev.user_id = u.id
      GROUP BY u.id
      ORDER BY (recipes_created + reviews_written) DESC, u.created_at DESC
      LIMIT 15
    `);

    res.json({
      recipeSummaries,
      recentReviews,
      activeUsers
    });
  } catch (error) {
    console.error('Error fetching overview data:', error);
    res.status(500).json({ error: 'Failed to fetch overview data' });
  }
});

module.exports = router;

