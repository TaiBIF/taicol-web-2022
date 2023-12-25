import { Model, DataTypes } from 'sequelize';

import sequelize from 'src/db';

class Feedback extends Model {
	declare id: number;
	declare feedback_type: number;
	declare title: string;
	declare description: string; 
	declare reference: string; 
	declare notify: boolean; 
	declare name: string;
	declare email: string;
	declare response: string;
	declare taxon_id: string;
	declare is_solved: boolean;
	declare is_sent: boolean;
	declare createdAt: Date;
	declare updatedAt: Date;
}

Feedback.init(
	{
		id: {
			type: DataTypes.INTEGER.UNSIGNED,
			autoIncrement: true,
			primaryKey: true,
		},
		feedback_type: {
			type: DataTypes.INTEGER.UNSIGNED,
			allowNull: true,
		},
		title: {
			type: new DataTypes.STRING(1000),
			allowNull: true,
		},
		description: {
			type: new DataTypes.TEXT('long'),
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
		taxon_id: {
			type: new DataTypes.STRING(20),
			allowNull: true,
		},
		is_solved: {
			type: new DataTypes.BOOLEAN,
			allowNull: true,
		},
		is_sent: {
			type: new DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: 1,
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
		tableName: 'feedback',
		sequelize,
	}
);

export default Feedback;