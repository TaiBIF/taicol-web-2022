module.exports = {
    "up": "ALTER TABLE downloads ADD COLUMN title_eng VARCHAR(1000), ADD COLUMN description_eng TEXT;",
    "down": "ALTER TABLE downloads DROP COLUMN title_eng, DROP COLUMN description_eng;"
}