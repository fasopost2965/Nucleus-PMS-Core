import mysql, { Pool } from 'mysql2/promise';
import { config } from './config';
import { readFallbackData } from './fallback';

let pool: Pool | null = null;

export function getDbPool(): Pool {
  if (!pool) {
    pool = mysql.createPool({
      host: config.mysqlHost,
      port: config.mysqlPort,
      user: config.mysqlUser,
      password: config.mysqlPassword,
      database: config.mysqlDatabase,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      decimalNumbers: true,
    });
  }

  return pool;
}

function getFallbackTable(sql: string): string | null {
  const match = sql.match(/FROM\s+([\w_]+)/i);
  return match ? match[1] : null;
}

export async function query<T = any>(sql: string, params: any[] = []): Promise<T> {
  try {
    const [rows] = await getDbPool().query(sql, params);
    return rows as unknown as T;
  } catch (error) {
    const table = getFallbackTable(sql);
    if (table) {
      const fallback = readFallbackData(table);
      return fallback as unknown as T;
    }
    throw error;
  }
}
