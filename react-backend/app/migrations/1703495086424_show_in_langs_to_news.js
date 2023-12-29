module.exports = {
    "up": "ALTER TABLE news ADD COLUMN `show_in_zh` tinyint(1) NOT NULL DEFAULT 1, ADD COLUMN `show_in_en` tinyint(1) NOT NULL DEFAULT 0;",
    "down": "ALTER TABLE news DROP COLUMN show_in_zh, show_in_en;"
}