const express = require("express");
const db = require("../db");

const router = express.Router();

router.get("/", (req, res) => {
  const q = req.query.q;
  if (!q) return res.json({ users: [], hashtags: [] });

  const queryLike = `%${q}%`;
  const queryTag = q.replace(/^#/, '');

  const users = db.prepare(`
    SELECT id, username, display_name
    FROM users
    WHERE username LIKE ? OR display_name LIKE ?
    LIMIT 10
  `).all(queryLike, queryLike);

  const hashtags = db.prepare(`
    SELECT name
    FROM hashtags
    WHERE name LIKE ?
    LIMIT 10
  `).all(`%${queryTag}%`);

  res.json({ users, hashtags });
});

module.exports = router;
