module.exports = {
    "up": "CREATE TABLE `register_taxon` ( \
        `id` int unsigned NOT NULL AUTO_INCREMENT, \
        `register_type` tinyint(2) NULL, \
        `bio_group` varchar(20) NULL, \
        `reference` text NULL, \
        `notify` tinyint(1) NOT NULL DEFAULT 1, \
        `name` varchar(1000) NULL, \
        `email` varchar(1000) NULL, \
        `response` text NULL, \
        `is_solved` tinyint(1) NOT NULL DEFAULT 0, \
        `is_sent` tinyint(1) NOT NULL DEFAULT 0, \
        `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \
        `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \
        PRIMARY KEY (`id`) \
      ); \
      ", 
    "down": 'DROP TABLE `register_taxon`'
}