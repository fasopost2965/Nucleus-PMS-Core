import winston from 'winston';
import { appConfig } from './app';

const { combine, timestamp, printf, colorize, json } = winston.format;

// Format lisible pour le développement
const devFormat = combine(
  colorize(),
  timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
    return `[${timestamp}] ${level}: ${message} ${metaStr}`;
  })
);

// Format JSON structuré pour la production
const prodFormat = combine(
  timestamp(),
  json()
);

export const logger = winston.createLogger({
  level: appConfig.nodeEnv === 'production' ? 'info' : 'debug',
  format: appConfig.nodeEnv === 'production' ? prodFormat : devFormat,
  transports: [
    new winston.transports.Console()
  ]
});
