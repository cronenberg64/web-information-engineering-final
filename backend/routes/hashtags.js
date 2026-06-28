const express = require("express");
const db = require("../db");

const router = express.Router();

router.get("/:tag", (req, res) => {
  const tag = req.params.tag.toLowerCase();

  const posts = db.prepare(`
    SELECT posts.*, users.username, users.display_name
    FROM posts
    JOIN users ON posts.user_id = users.id
    JOIN post_hashtags ON posts.id = post_hashtags.post_id
    JOIN hashtags ON hashtags.id = post_hashtags.hashtag_id
    WHERE hashtags.name = ? AND posts.expires_at > CURRENT_TIMESTAMP
    ORDER BY posts.created_at DESC
  `).all(tag);

  res.json(posts);
});

module.exports = router;
