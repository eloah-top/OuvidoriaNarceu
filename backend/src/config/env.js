import 'dotenv/config';

export const env = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || '*',
  databaseUrl: process.env.DATABASE_URL || '',
  databaseDialect: process.env.DATABASE_DIALECT || '',
  databaseStorage: process.env.DB_STORAGE || './data/ouvidoria.sqlite',
  databaseSsl: process.env.DB_SSL === 'true',
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.SMTP_FROM || process.env.SMTP_USER || '',
    secure: process.env.SMTP_SECURE === 'true',
  },
  setorEmails: {
    direcao: process.env.EMAIL_DIRECAO || '',
    pedagogico: process.env.EMAIL_PEDAGOGICO || '',
    secretaria: process.env.EMAIL_SECRETARIA || '',
    apoie: process.env.EMAIL_APOIE || '',
    tutor: process.env.EMAIL_TUTOR || '',
  },
  setorResponsaveis: {
    direcao: 'Direção',
    pedagogico: 'Pedagogo',
    secretaria: 'Secretaria',
    apoie: 'APOIE',
    tutor: 'Tutor',
  },
};
