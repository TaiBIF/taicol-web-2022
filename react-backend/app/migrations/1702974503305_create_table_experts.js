module.exports = {
    "up": "CREATE TABLE `experts` ( \
        `id` int unsigned NOT NULL AUTO_INCREMENT, \
        `person_id` int unsigned DEFAULT NULL, \
        `name` varchar(256) DEFAULT NULL, \
        `name_e` varchar(1000) DEFAULT NULL, \
        `email` varchar(256) DEFAULT NULL, \
        `taxon_group` varchar(256) DEFAULT NULL, \
        `createdAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \
        `updatedAt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP, \
        PRIMARY KEY (`id`) \
      ); \
      ", 
    "down": 'DROP TABLE `experts`'
}
