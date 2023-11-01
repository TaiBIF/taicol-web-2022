import { Model, DataTypes } from 'sequelize';

import sequelize from 'src/db';

class Category extends Model {
	declare id: number;
	declare name: string;
	declare type: string;
	declare sort: number;
}

Category.init(
	{
		id: {
			type: DataTypes.INTEGER.UNSIGNED,
			autoIncrement: true,
			primaryKey: true,
		},
		type: {
			type: new DataTypes.STRING(45),
			allowNull: false,
		},
		name: {
			type: new DataTypes.STRING(256),
			allowNull: false,
		},
		name_eng: {
			type: new DataTypes.STRING(1000),
			allowNull: false,
		},
		color: {
			type: new DataTypes.STRING(10),
			allowNull: true,
		},
		sort: {
			type: new DataTypes.SMALLINT,
			allowNull: true,
		},
	},
	{
		tableName: 'categories',
		sequelize,
	}
);

export default Category;
