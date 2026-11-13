import { env } from './config/env.js';
import { sequelize } from './config/database.js';
import { Manifestacao, Turma } from './models/index.js';
import { seedTurmas } from './seeds/turmas.seed.js';
import fs from 'node:fs';
import path from 'node:path';

export async function initDatabase() {
  if (!env.databaseUrl) {
    const dir = path.dirname(env.databaseStorage);
    if (dir && dir !== '.') fs.mkdirSync(dir, { recursive: true });
  }
  await sequelize.authenticate();
  await sequelize.sync({ alter: env.nodeEnv !== 'production' });
  await seedTurmas(Turma);
}

export { sequelize, Manifestacao, Turma };
