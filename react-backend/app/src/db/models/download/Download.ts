import { Model, DataTypes } from 'sequelize';

import sequelize from 'src/db';

class Download extends Model {
	declare id: number;
	declare title: string;
	declare description: string;
	declare publish: boolean;
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
		title_eng: {
			type: new DataTypes.STRING(1000),
			allowNull: false,
		},
		description_eng: {
			type: new DataTypes.TEXT,
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
