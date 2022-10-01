import { Model, DataTypes } from 'sequelize';

import sequelize from 'src/db';

class ApidocParam extends Model {
	declare id: number;
	declare keyword: string;
	declare description: string;
	declare url: string;
}

ApidocParam.init(
	{
		id: {
			type: DataTypes.INTEGER.UNSIGNED,
			autoIncrement: true,
			primaryKey: true,
		},
		keyword: {
			type: new DataTypes.STRING(256),
			allowNull: false,
		},
		description: {
			type: new DataTypes.STRING(256),
			allowNull: true,
		},
		url: {
			type: new DataTypes.STRING(256),
			allowNull: true,
		},
	},
	{
		tableName: 'apidoc_params',
		sequelize,
	}
);

export default ApidocParam;
