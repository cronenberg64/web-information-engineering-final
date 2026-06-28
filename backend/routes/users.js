const express = require("express");
const db = require("../db");

const router = express.Router();

router.get("/:username", (req, res) => {
  const { username } = req.params;

  const user = db.prepare(`
    SELECT id, username, display_name
    FROM users
    WHERE username = ?
  `).get(username);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const posts = db.prepare(`
    SELECT posts.*, users.username, users.display_name
    FROM posts
    JOIN users ON posts.user_id = users.id
    WHERE users.id = ? AND posts.expires_at > CURRENT_TIMESTAMP
    ORDER BY posts.created_at DESC
  `).all(user.id);

  res.json({ user, posts });
});

module.exports = router;
