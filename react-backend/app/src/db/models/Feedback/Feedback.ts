import { Model, DataTypes } from 'sequelize';

import sequelize from 'src/db';

class Feedback extends Model {
	declare id: number;
	declare type: string;
	declare title: string;
	declare description: string;
	declare reference: string;
	declare notify: boolean;
    declare name: string;
    declare email:  string;
    declare response: string;
    declare is_solved: boolean;
	declare updatedAt: string;
	declare createdAt: string;
}

Feedback.init(
	{
		id: {
			type: DataTypes.INTEGER.UNSIGNED,
			autoIncrement: true,
			primaryKey: true,
		},
		type: {
			type: new DataTypes.STRING(45),
			allowNull: true,
		},
		title: {
			type: new DataTypes.STRING(1000),
			allowNull: false,
		},
		description: {
			type: new DataTypes.TEXT,
			allowNull: true,
		},
		reference: {
			type: new DataTypes.TEXT,
			allowNull: true,
		},
		notify: {
			type: new DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: true,
		},
		email: {
			type: new DataTypes.STRING(1000),
			allowNull: false,
		},
		response: {
			type: new DataTypes.TEXT,
			allowNull: true,
		},
		is_solved: {
			type: new DataTypes.BOOLEAN,
			allowNull: false,
		},
		createdAt: {
			type: new DataTypes.DATE,
			allowNull: false,
			defaultValue: 'CURRENT_TIMESTAMP',
		},
		updatedAt: {
			type: new DataTypes.DATE,
			allowNull: false,
			defaultValue: 'CURRENT_TIMESTAMP',
		},
	},
	{
		tableName: 'feedback',
		sequelize,
	}
);

export default Feedback;
