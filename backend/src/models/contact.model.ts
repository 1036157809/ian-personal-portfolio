import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config';

export class Contact extends Model {
  public id!: string;
  public name!: string;
  public email!: string;
  public message!: string;
  public readonly createdAt!: Date;
}

Contact.init(
  {
    id: {
      type: DataTypes.STRING(255),
      primaryKey: true,
      defaultValue: () => Date.now().toString()
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    tableName: 'contacts',
    timestamps: true,
    underscored: true
  }
);

export default Contact;
