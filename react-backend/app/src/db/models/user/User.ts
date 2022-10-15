import { Model, DataTypes } from 'sequelize';

import sequelize from 'src/db';
import { Role, RoleOptions } from 'src/form/options';

class User extends Model {
	declare id: number;
	declare name: string;
	declare first_name: string;
	declare last_name: string;
	declare password: string;
	declare email: string;
	declare image: string;
	declare role: Role;
}

User.init(
	{
		id: {
			type: DataTypes.INTEGER.UNSIGNED,
			autoIncrement: true,
			primaryKey: true,
		},
		name: {
			type: new DataTypes.STRING(128),
			allowNull: true,
		},
		first_name: {
			type: new DataTypes.STRING(128),
			allowNull: true,
		},
		last_name: {
			type: new DataTypes.STRING(128),
			allowNull: true,
		},
		password: {
			type: new DataTypes.STRING(60),
			allowNull: false,
		},
		phone: {
			type: new DataTypes.STRING(128),
			allowNull: true,
    },
    status: {
			type: new DataTypes.ENUM({
       ['values']: ['active', 'inactive','deleted'],
    }),
      allowNull: false,
      defaultValue: 'active',
    },
		role: {
			type: new DataTypes.ENUM({
  values: RoleOptions.map(role => role.value)
    }),
			allowNull: true,
		},
		email: {
			type: new DataTypes.STRING(128),
			allowNull: false,
		},
		image: {
			type: new DataTypes.STRING(1000),
			allowNull: true,
		},
	},
	{
		tableName: 'users',
		sequelize,
	}
);

export default User;
