const Database = require("better-sqlite3");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const dbPath = process.env.DB_PATH 
  ? path.resolve(path.join(__dirname, ".."), process.env.DB_PATH) 
  : path.join(__dirname, "apple-tree.db");
const db = new Database(dbPath);

function ensureColumn(tableName, columnName, definition) {
  const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
  const exists = columns.some((column) => column.name === columnName);

  if (!exists) {
    db.exec(`ALTER TABLE ${tableName} ADD COLUMN ${columnName} ${definition}`);
  }
}

const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
db.exec(schema);

ensureColumn("users", "profile_picture_url", "TEXT");
ensureColumn("posts", "media_url", "TEXT");
ensureColumn("posts", "reply_to_id", "INTEGER");

module.exports = db;
