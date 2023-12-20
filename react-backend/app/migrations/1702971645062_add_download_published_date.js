module.exports = {
    "up": "ALTER TABLE downloads ADD COLUMN publishedDate datetime NOT NULL DEFAULT '2023-03-25';",
    "down": "ALTER TABLE downloads DROP COLUMN publishedDate;"
}