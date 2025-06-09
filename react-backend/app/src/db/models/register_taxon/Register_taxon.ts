import { Model, DataTypes } from 'sequelize';

import sequelize from 'src/db';

class Register_taxon extends Model {
	declare id: number;
	declare register_type: number;
	declare bio_group: string;
	declare reference: string; 
	declare notify: boolean; 
	declare name: string;
	declare email: string;
	declare response: string;
	declare is_solved: boolean;
	declare is_sent: boolean;
	declare createdAt: Date;
	declare updatedAt: Date;
}

Register_taxon.init(
	{
		id: {
			type: DataTypes.INTEGER.UNSIGNED,
			autoIncrement: true,
			primaryKey: true,
		},
		register_type: {
			type: DataTypes.INTEGER.UNSIGNED,
			allowNull: true,
		},
		bio_group: {
			type: new DataTypes.STRING(20),
			allowNull: true,
		},
		reference: {
			type: new DataTypes.TEXT('long'),
			allowNull: true,
		},
		notify: {
			type: new DataTypes.BOOLEAN,
			allowNull: true,
		},
		name: {
			type: new DataTypes.STRING(1000),
			allowNull: true,
		},
		email: {
			type: new DataTypes.STRING(1000),
			allowNull: true,
		},
		response: {
			type: new DataTypes.TEXT('long'),
			allowNull: true,
		},
		is_solved: {
			type: new DataTypes.BOOLEAN,
			allowNull: true,
		},
		is_sent: {
			type: new DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: 0,
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
		tableName: 'register_taxon',
		sequelize,
	}
);

export default Register_taxon;