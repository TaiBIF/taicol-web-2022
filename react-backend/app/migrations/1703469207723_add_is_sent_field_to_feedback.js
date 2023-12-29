module.exports = {
    "up": "ALTER TABLE feedback ADD COLUMN `is_sent` tinyint(1) NOT NULL DEFAULT 0;",
    "down": "ALTER TABLE feedback DROP COLUMN is_sent;"
}