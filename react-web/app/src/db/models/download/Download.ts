import { Model, DataTypes } from 'sequelize';

import sequelize from 'src/db';

class Download extends Model {
	declare id: number;
	declare category: string;
	declare author: string;
	declare title: string;
	declare description: string;
}

Download.init(
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
		description: {
			type: new DataTypes.TEXT,
			allowNull: false,
		},
		file: {
			type: new DataTypes.STRING(2000),
			allowNull: false,
		},
		publish: {
			type: new DataTypes.BOOLEAN,
			allowNull: false,
		},
	},
	{
		tableName: 'downloads',
		sequelize,
	}
);

export default Download;
