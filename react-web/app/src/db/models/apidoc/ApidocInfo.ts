import { Model, DataTypes } from 'sequelize';

import sequelize from 'src/db';

class ApidocInfo extends Model {
	declare id: number;
	declare title: string;
	declare url: string;
	declare combine_url: string;
}

ApidocInfo.init(
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
		url: {
			type: new DataTypes.STRING(256),
			allowNull: false,
    },
    combine_url: {
			type: new DataTypes.STRING(256),
			allowNull: false,

    }
	},
	{
		tableName: 'apidoc_info',
		sequelize,
	}
);

export default ApidocInfo;
