import { DataTypes, Model } from 'sequelize';
import { sequelize } from 'src/config/database';

export class AiUsageStats extends Model {
  public id!: number;
  public call_date!: string;   // YYYY-MM-DD
  public call_count!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

AiUsageStats.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    call_date: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: true,
      comment: 'Date in YYYY-MM-DD format',
    },
    call_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Number of AI calls on this date',
    },
  },
  {
    sequelize,
    tableName: 'ai_usage_stats',
    timestamps: true,
    underscored: true,
  }
);

export default AiUsageStats;
