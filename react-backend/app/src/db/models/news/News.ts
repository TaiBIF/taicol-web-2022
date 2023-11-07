import { Model, DataTypes } from 'sequelize';

import sequelize from 'src/db';

class New extends Model {
	declare id: number;
	declare category: string;
	declare title: string;
	declare slug: string;
	declare description: string;
	declare publish: boolean;
	declare publishedDate: Date;
}

New.init(
	{
		id: {
			type: DataTypes.INTEGER.UNSIGNED,
			autoIncrement: true,
			primaryKey: true,
		},
		title: {
			type: new DataTypes.STRING(256),
			allowNull: false,
		},
		publishedDate: {
			type: new DataTypes.DATE,
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
		tableName: 'news',
		sequelize,
	}
);

export default New;
