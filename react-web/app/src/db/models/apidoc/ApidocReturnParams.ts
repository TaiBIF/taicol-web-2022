import { Model, DataTypes } from 'sequelize';

import sequelize from 'src/db';

class ApidocReturnParam extends Model {
	declare id: number;
	declare keyword: string;
	declare description: string;
	declare remark: string;
}

ApidocReturnParam.init(
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
		remark: {
			type: new DataTypes.STRING(256),
			allowNull: true,
		},
	},
	{
		tableName: 'apidoc_return_params',
		sequelize,
	}
);

export default ApidocReturnParam;
