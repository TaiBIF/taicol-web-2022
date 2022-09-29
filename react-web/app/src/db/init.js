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
    await initTables();
	})
	.catch((e) => console.log('Error:' + e));


const initTables = async () => {
  const checkUser = await User.findOne({
    where:{email:process.env.DEFAULT_ADMIN_EMAIL},
  });

  // create default admin user
  if (!checkUser) {

    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    const password = bcrypt.hashSync(process.env.DEFAULT_ADMIN_PASSWORD, salt)

    await User.create({
      email: process.env.DEFAULT_ADMIN_EMAIL,
      password: password,
      name:'Administator',
      role: 'admin',
      status: 'active',
    });
  }
}
