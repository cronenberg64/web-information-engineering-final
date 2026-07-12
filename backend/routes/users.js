const express = require("express");
const db = require("../db");
const { requireAuth, optionalAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/:username", optionalAuth, (req, res) => {
  const { username } = req.params;
  const currentUserId = req.user ? req.user.id : null;

  const user = db.prepare(`
    SELECT id, username, display_name, profile_picture_url
    FROM users
    WHERE username = ?
  `).get(username);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const posts = db.prepare(`
    SELECT 
      posts.*, 
      author.username, 
      author.display_name, 
      author.profile_picture_url,
      (SELECT COUNT(*) FROM likes WHERE likes.post_id = posts.id) as like_count,
      (SELECT COUNT(*) FROM reposts WHERE reposts.post_id = posts.id) as repost_count,
      (SELECT COUNT(*) FROM posts replies WHERE replies.reply_to_id = posts.id) as reply_count,
      EXISTS(SELECT 1 FROM likes WHERE likes.post_id = posts.id AND likes.user_id = ?) as is_liked,
      EXISTS(SELECT 1 FROM reposts WHERE reposts.post_id = posts.id AND reposts.user_id = ?) as is_reposted,
      0 as is_profile_repost,
      NULL as reposter_username,
      posts.created_at as sort_time
    FROM posts
    JOIN users as author ON posts.user_id = author.id
    WHERE author.id = ? AND posts.expires_at > CURRENT_TIMESTAMP

    UNION ALL

    SELECT 
      posts.*, 
      author.username, 
      author.display_name, 
      author.profile_picture_url,
      (SELECT COUNT(*) FROM likes WHERE likes.post_id = posts.id) as like_count,
      (SELECT COUNT(*) FROM reposts WHERE reposts.post_id = posts.id) as repost_count,
      (SELECT COUNT(*) FROM posts replies WHERE replies.reply_to_id = posts.id) as reply_count,
      EXISTS(SELECT 1 FROM likes WHERE likes.post_id = posts.id AND likes.user_id = ?) as is_liked,
      EXISTS(SELECT 1 FROM reposts WHERE reposts.post_id = posts.id AND reposts.user_id = ?) as is_reposted,
      1 as is_profile_repost,
      reposter.username as reposter_username,
      reposts.created_at as sort_time
    FROM reposts
    JOIN posts ON reposts.post_id = posts.id
    JOIN users as author ON posts.user_id = author.id
    JOIN users as reposter ON reposts.user_id = reposter.id
    WHERE reposter.id = ? AND posts.expires_at > CURRENT_TIMESTAMP

    ORDER BY sort_time DESC
  `).all(currentUserId, currentUserId, user.id, currentUserId, currentUserId, user.id);

  const stats = db.prepare(`
    SELECT 
      (SELECT COUNT(*) FROM follows WHERE following_id = ?) as follower_count,
      (SELECT COUNT(*) FROM follows WHERE follower_id = ?) as following_count
  `).get(user.id, user.id);

  let is_following = false;
  if (currentUserId) {
    const follow = db.prepare(`
      SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?
    `).get(currentUserId, user.id);
    if (follow) is_following = true;
  }

  user.follower_count = stats.follower_count;
  user.following_count = stats.following_count;
  user.is_following = is_following;

  res.json({ user, posts: posts.map(p => ({ ...p, is_liked: !!p.is_liked })) });
});

router.post("/:username/follow", requireAuth, (req, res) => {
  const { username } = req.params;
  const followerId = req.user.id;

  const userToFollow = db.prepare(`SELECT id FROM users WHERE username = ?`).get(username);
  if (!userToFollow) return res.status(404).json({ error: "User not found" });

  if (followerId === userToFollow.id) {
    return res.status(400).json({ error: "Cannot follow yourself" });
  }

  db.prepare(`
    INSERT OR IGNORE INTO follows (follower_id, following_id) 
    VALUES (?, ?)
  `).run(followerId, userToFollow.id);

  db.prepare(`INSERT INTO notifications (user_id, type, source_user_id) VALUES (?, 'follow', ?)`).run(userToFollow.id, followerId);

  res.json({ following: true });
});

router.delete("/:username/follow", requireAuth, (req, res) => {
  const { username } = req.params;
  const followerId = req.user.id;

  const userToUnfollow = db.prepare(`SELECT id FROM users WHERE username = ?`).get(username);
  if (!userToUnfollow) return res.status(404).json({ error: "User not found" });

  db.prepare(`
    DELETE FROM follows WHERE follower_id = ? AND following_id = ?
  `).run(followerId, userToUnfollow.id);

  db.prepare(`DELETE FROM notifications WHERE user_id = ? AND source_user_id = ? AND type = 'follow'`).run(userToUnfollow.id, followerId);

  res.json({ following: false });
});

const bcrypt = require("bcryptjs");

router.put("/profile", requireAuth, async (req, res) => {
  const userId = req.user.id;
  const { display_name, password, profile_picture_url } = req.body;

  if (display_name) {
    db.prepare(`UPDATE users SET display_name = ? WHERE id = ?`).run(display_name, userId);
  }

  if (profile_picture_url) {
    db.prepare(`UPDATE users SET profile_picture_url = ? WHERE id = ?`).run(profile_picture_url, userId);
  }

  if (password) {
    const password_hash = await bcrypt.hashSync(password, 6);
    db.prepare(`UPDATE users SET password_hash = ? WHERE id = ?`).run(password_hash, userId);
  }

  const updatedUser = db.prepare(`SELECT id, username, display_name, profile_picture_url FROM users WHERE id = ?`).get(userId);
  res.json({ user: updatedUser });
});

module.exports = router;
