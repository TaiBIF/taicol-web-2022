import { Model, DataTypes } from 'sequelize';

import sequelize from 'src/db';

class Apidoc extends Model {
	declare id: number;
	declare title: string;
	declare url: string;
	declare combine_url: string;
}

Apidoc.init(
	{
		id: {
			type: DataTypes.INTEGER.UNSIGNED,
			autoIncrement: true,
			primaryKey: true,
		},
		content: {
			type: new DataTypes.TEXT,
			allowNull: true,
    },
		markdown: {
			type: new DataTypes.STRING(1000),
			allowNull: true,
    }
	},
	{
		tableName: 'apidoc',
		sequelize,
	}
);

export default Apidoc;
