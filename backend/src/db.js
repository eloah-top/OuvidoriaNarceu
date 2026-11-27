import { env } from './config/env.js';
import { sequelize } from './config/database.js';
import { Manifestacao } from './models/index.js';
import fs from 'node:fs';
import path from 'node:path';

export async function initDatabase() {
  if (!env.databaseUrl) {
    const dir = path.dirname(env.databaseStorage);
    if (dir && dir !== '.') fs.mkdirSync(dir, { recursive: true });
  }
  await sequelize.authenticate();
  await sequelize.query('DROP TABLE IF EXISTS turmas');
  await sequelize.sync();
}

export { sequelize, Manifestacao };