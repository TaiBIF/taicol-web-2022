import { Model, DataTypes } from 'sequelize';

import sequelize from 'src/db';

class DownloadFile extends Model {
	declare id: number;
	declare url: string;
	declare type: string;
}

DownloadFile.init(
	{
		id: {
			type: DataTypes.INTEGER.UNSIGNED,
			autoIncrement: true,
			primaryKey: true,
		},
		type: {
			type: new DataTypes.STRING(45),
			allowNull: false,
		},
		url: {
			type: new DataTypes.STRING(1000),
			allowNull: false,
		}
	},
	{
		tableName: 'download_files',
		sequelize,
	}
);

export default DownloadFile;
