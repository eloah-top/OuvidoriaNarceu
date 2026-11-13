import 'dotenv/config';

export const env = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  databaseUrl: process.env.DATABASE_URL || '',
  databaseDialect: process.env.DATABASE_DIALECT || '',
  databaseStorage: process.env.DB_STORAGE || './data/ouvidoria.sqlite',
  databaseSsl: process.env.DB_SSL === 'true',
  turmasSeed: (process.env.TURMAS_SEED || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((nome) => ({ nome, turno: 'diurno' })),
};
