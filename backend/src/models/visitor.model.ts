import { DataTypes, Model } from 'sequelize';
import { sequelize } from 'src/config/database';

/**
 * 访问日志 — 用于 IP 去重
 * 同一天同一个 ip_hash 只记录一次
 */
export class VisitorLog extends Model {
  public id!: number;
  public visit_date!: string;
  public ip_hash!: string;
  public readonly createdAt!: Date;
}

VisitorLog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    visit_date: {
      type: DataTypes.STRING(10),
      allowNull: false,
      comment: 'Date in YYYY-MM-DD format',
    },
    ip_hash: {
      type: DataTypes.STRING(64),
      allowNull: false,
      comment: 'SHA256(ip + salt)',
    },
  },
  {
    sequelize,
    tableName: 'visitor_log',
    timestamps: true,
    updatedAt: false,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['visit_date', 'ip_hash'],
        name: 'uk_date_ip',
      },
    ],
  }
);

/**
 * 每日访问汇总 — 用于快速查询统计
 */
export class VisitorDailySummary extends Model {
  public id!: number;
  public visit_date!: string;
  public uv_count!: number;
  public pv_count!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

VisitorDailySummary.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    visit_date: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: true,
      comment: 'Date in YYYY-MM-DD format',
    },
    uv_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Unique visitors (deduped by IP)',
    },
    pv_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Page views (every page load)',
    },
  },
  {
    sequelize,
    tableName: 'visitor_daily_summary',
    timestamps: true,
    underscored: true,
  }
);

export default { VisitorLog, VisitorDailySummary };
