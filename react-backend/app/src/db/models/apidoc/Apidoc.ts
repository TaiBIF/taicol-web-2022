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
		markdown: {
			type: new DataTypes.STRING(256),
			allowNull: true,
    }
	},
	{
		tableName: 'apidoc',
		sequelize,
	}
);

export default Apidoc;
