import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: Number(process.env.PORT || 3000),
  mysqlHost: process.env.MYSQL_HOST || '127.0.0.1',
  mysqlPort: Number(process.env.MYSQL_PORT || 3306),
  mysqlUser: process.env.MYSQL_USER || 'root',
  mysqlPassword: process.env.MYSQL_PASSWORD || '',
  mysqlDatabase: process.env.MYSQL_DATABASE || 'nucleus_pms',
  jwtSecret: process.env.JWT_SECRET || 'change_this_secret',
  nodeEnv: process.env.NODE_ENV || 'development',
};
