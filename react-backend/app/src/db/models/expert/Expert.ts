import { Model, DataTypes } from 'sequelize';

import sequelize from 'src/db';

class Expert extends Model {
	declare id: number;
	declare name: string;
	declare name_e: string;
	declare person_id: number; // 對應nametool的person_id
	declare email: string;
	declare taxon_group: string;
	declare updatedAt: Date;
	declare createdAt: Date;
}

Expert.init(
	{
		id: {
			type: DataTypes.INTEGER.UNSIGNED,
			autoIncrement: true,
			primaryKey: true,
		},
		person_id: {
			type: DataTypes.INTEGER.UNSIGNED,
			allowNull: true,
		},
		name: {
			type: new DataTypes.STRING(256),
			allowNull: true,
		},
		name_e: {
			type: new DataTypes.STRING(1000),
			allowNull: true,
		},
		email: {
			type: new DataTypes.STRING(256),
			allowNull: true,
		},
		taxon_group: {
			type: new DataTypes.STRING(256),
			allowNull: true,
		},
		updatedAt: {
			type: new DataTypes.DATE,
			allowNull: false,
		},
		createdAt: {
			type: new DataTypes.DATE,
			allowNull: false,
		},
	},
	{
		tableName: 'experts',
		sequelize,
	}
);

export default Expert;
