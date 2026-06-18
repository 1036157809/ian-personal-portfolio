import { DataTypes, Model } from 'sequelize';
import { sequelize } from 'src/config/database';

export class SystemConfig extends Model {
  public id!: number;
  public key!: string;
  public value!: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

SystemConfig.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    key: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      comment: 'Config key, e.g. embedding_base_url',
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Config value',
    },
  },
  {
    sequelize,
    tableName: 'system_config',
    timestamps: true,
    underscored: true,
  }
);

export default SystemConfig;
