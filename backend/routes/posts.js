const express = require("express");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/", (req, res) => {
  const posts = db.prepare(`
    SELECT posts.*, users.username, users.display_name
    FROM posts
    JOIN users ON posts.user_id = users.id
    WHERE posts.expires_at > CURRENT_TIMESTAMP
    ORDER BY posts.created_at DESC
  `).all();
  res.json(posts);
});

router.post("/", requireAuth, (req, res) => {
  const { content } = req.body;
  const userId = req.user.id;

  if (!content || !content.trim()) {
    return res.status(400).json({ error: "Post cannot be empty" });
  }
  const trimmedContent = content.trim();
  if (trimmedContent.length > 280) {
    return res.status(400).json({ error: "Post cannot exceed 280 characters" });
  }

  const hashtags = [...new Set((trimmedContent.match(/#(\w+)/g) || []).map(tag => tag.slice(1).toLowerCase()))];

  const result = db.prepare(`
    INSERT INTO posts (user_id, content, expires_at)
    VALUES (?, ?, datetime('now', '+24 hours'))
  `).run(userId, trimmedContent);

  const postId = result.lastInsertRowid;

  for (const tag of hashtags) {
    db.prepare(`INSERT OR IGNORE INTO hashtags (name) VALUES (?)`).run(tag);
    const hashtag = db.prepare(`SELECT id FROM hashtags WHERE name = ?`).get(tag);
    db.prepare(`INSERT OR IGNORE INTO post_hashtags (post_id, hashtag_id) VALUES (?, ?)`).run(postId, hashtag.id);
  }

  const post = db.prepare(`
    SELECT posts.*, users.username, users.display_name
    FROM posts
    JOIN users ON posts.user_id = users.id
    WHERE posts.id = ?
  `).get(postId);

  res.status(201).json(post);
});

module.exports = router;
