import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(process.env.DATABASE_URL as string);

sequelize
	.authenticate()
	.then(() => {
		console.log('Database connected');
    sequelize.sync({ alter: true });
	})
	.catch((e) => console.log('Error:' + e));

sequelize.authenticate()
.then(() => {
  console.log('Connection has been established successfully.');
})
.catch(err => {
  console.error('Unable to connect to the database:', err);
});

export default sequelize;
