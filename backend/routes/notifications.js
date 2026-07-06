const express = require("express");
const db = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/", requireAuth, (req, res) => {
  const userId = req.user.id;

  const notifications = db.prepare(`
    SELECT notifications.*, users.username, users.display_name
    FROM notifications
    JOIN users ON notifications.source_user_id = users.id
    WHERE notifications.user_id = ?
    ORDER BY notifications.created_at DESC
    LIMIT 50
  `).all(userId);

  res.json(notifications);
});

router.put("/read", requireAuth, (req, res) => {
  const userId = req.user.id;
  db.prepare(`UPDATE notifications SET is_read = 1 WHERE user_id = ?`).run(userId);
  res.json({ success: true });
});

module.exports = router;
