import { Sequelize } from 'sequelize';
import path from 'path';

export const isProduction = process.env.NODE_ENV === 'production';

export const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USER || 'portfolio',
  password: process.env.DB_PASSWORD || 'portfolio',
  database: process.env.DB_NAME || 'portfolio',
  dialect: isProduction ? ('mysql' as const) : ('sqlite' as const),
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  storage: isProduction ? undefined : path.join(process.cwd(), 'database.sqlite'),
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
};

export const sequelize = isProduction 
  ? new Sequelize(
      dbConfig.database,
      dbConfig.username,
      dbConfig.password,
      dbConfig
    )
  : new Sequelize({
      dialect: 'sqlite',
      storage: dbConfig.storage,
      logging: dbConfig.logging,
    });

export async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established successfully');
    return true;
  } catch (error) {
    console.error('Unable to connect to database:', error);
    return false;
  }
}

export default dbConfig;
