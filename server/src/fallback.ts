import fs from 'fs';
import path from 'path';

const fallbackPath = path.resolve(process.cwd(), 'server/data/fallback.json');

export function readFallbackData(tableName: string): any[] {
  try {
    const raw = fs.readFileSync(fallbackPath, 'utf-8');
    const json = JSON.parse(raw || '{}');
    return Array.isArray(json[tableName]) ? json[tableName] : [];
  } catch (error) {
    return [];
  }
}

export function writeFallbackData(tableName: string, rows: any[]): void {
  try {
    const raw = fs.existsSync(fallbackPath) ? fs.readFileSync(fallbackPath, 'utf-8') : '{}';
    const json = raw ? JSON.parse(raw) : {};
    json[tableName] = rows;
    fs.writeFileSync(fallbackPath, JSON.stringify(json, null, 2), 'utf-8');
  } catch (error) {
    console.error('Fallback write failed', error);
  }
}
