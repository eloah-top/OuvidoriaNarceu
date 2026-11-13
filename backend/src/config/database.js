import { Sequelize } from 'sequelize';
import { env } from './env.js';

const dialect = env.databaseUrl
  ? (env.databaseDialect || 'postgres')
  : 'sqlite';

export const sequelize = env.databaseUrl
  ? new Sequelize(env.databaseUrl, {
      dialect,
      logging: env.nodeEnv !== 'production' ? console.log : false,
      dialectOptions: env.databaseSsl ? { ssl: { require: true, rejectUnauthorized: false } } : {},
    })
  : new Sequelize({
      dialect: 'sqlite',
      storage: env.databaseStorage,
      logging: env.nodeEnv !== 'production' ? console.log : false,
    });
