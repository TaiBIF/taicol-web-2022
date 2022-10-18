const Sequelize = require('sequelize');
const User = require('src/db/models/user/User');
const Category = require('src/db/models/Category');
const New = require('src/db/models/news/New');
const Article = require('src/db/models/article/Article');
const Download = require('src/db/models/download/Download');

const sequelize = new Sequelize(process.env.DATABASE_URL);

sequelize
	.authenticate()
	.then(async () => {
		console.log('Database connected');
    sequelize.sync({ force: true });
	})
	.catch((e) => console.log('Error:' + e));

