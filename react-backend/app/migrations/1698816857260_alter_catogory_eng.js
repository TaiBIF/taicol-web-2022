module.exports = {
    "up": "ALTER TABLE categories ADD COLUMN name_eng VARCHAR(1000);",
    "down": "ALTER TABLE categories DROP COLUMN name_eng;"
}