import { Model, DataTypes } from 'sequelize';

import sequelize from 'src/db';

class Faq extends Model {
	declare id: number;
	declare category: string;
	declare title: string;
	declare description: string;
	declare sort: number;
	declare publish: boolean;
}

Faq.init(
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
		description: {
			type: new DataTypes.TEXT('long'),
			allowNull: false,
		},
		sort: {
			type: new DataTypes.SMALLINT,
			allowNull: true,
		},
		publish: {
			type: new DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: true,
		},
		show_in_zh: {
			type: new DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
		show_in_en: {
			type: new DataTypes.BOOLEAN,
			allowNull: false,
			defaultValue: false,
		},
	},
	{
		tableName: 'faqs',
		sequelize,
	}
);

export default Faq;
