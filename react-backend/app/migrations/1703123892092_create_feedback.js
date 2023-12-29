module.exports = {
    "up": "CREATE TABLE `feedback` ( \
        `id` int unsigned NOT NULL AUTO_INCREMENT, \
        `feedback_type` tinyint(2) NULL, \
        `title` varchar(1000) NOT NULL, \
        `description` text NULL, \
        `reference` text NULL, \
        `notify` tinyint(1) NOT NULL DEFAULT 1, \
        `name` varchar(1000) NULL, \
        `email` varchar(1000) NULL, \
        `response` text NULL, \
        `taxon_id` VARCHAR(20) NULL, \
        `is_solved` tinyint(1) NOT NULL DEFAULT 0, \
        `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \
        `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \
        PRIMARY KEY (`id`) \
      ); \
      ", 
    "down": 'DROP TABLE `feedback`'
}