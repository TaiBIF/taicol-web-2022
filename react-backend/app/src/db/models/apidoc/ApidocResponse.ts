import { Model, DataTypes } from 'sequelize';

import sequelize from 'src/db';

class ApidocResponse extends Model {
	declare id: number;
	declare title: string;
	declare content: string;
}

ApidocResponse.init(
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
		content: {
			type: new DataTypes.TEXT,
			allowNull: false,
		}
	},
	{
		tableName: 'apidoc_responses',
		sequelize,
	}
);

export default ApidocResponse;
