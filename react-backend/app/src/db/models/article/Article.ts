import { Model, DataTypes } from 'sequelize';

import sequelize from 'src/db';

class Article extends Model {
	declare id: number;
	declare category: string;
	declare author: string;
	declare title: string;
	declare slug: string;
	declare description: string;
	declare publishedDate: Date;
}

Article.init(
	{
		id: {
			type: DataTypes.INTEGER.UNSIGNED,
			autoIncrement: true,
			primaryKey: true,
		},
		publishedDate: {
			type: new DataTypes.DATE,
			allowNull: false,
		},
		author: {
			type: new DataTypes.STRING(256),
			allowNull: true,
		},
		authorInfo: {
			type: new DataTypes.STRING(1000),
			allowNull: true,
		},
		title: {
			type: new DataTypes.STRING(256),
			allowNull: false,
		},
		description: {
			type: new DataTypes.TEXT('long'),
			allowNull: false,
		},
		slug: {
			type: new DataTypes.STRING(1000),
			allowNull: false,
		},
		publish: {
			type: new DataTypes.BOOLEAN,
			allowNull: false,
		},
	},
	{
		tableName: 'articles',
		sequelize,
	}
);

export default Article;
