import { createApp } from './app.js';
import { env } from './config/env.js';
import { initDatabase, sequelize } from './db.js';

const app = createApp();

process.on('uncaughtException', (err) => {
  console.error('[backend] uncaughtException:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('[backend] unhandledRejection:', reason);
});

initDatabase()
  .then(() => {
    const server = app.listen(env.port, () => {
      console.log(`[backend] rodando em http://localhost:${env.port} (${env.nodeEnv})`);
    });
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`[backend] porta ${env.port} já está em uso. Encerre o processo anterior ou defina PORT.`);
      } else {
        console.error('[backend] erro no servidor:', err);
      }
      process.exit(1);
    });
  })
  .catch((err) => {
    console.error('[backend] falha ao iniciar banco:', err);
    process.exit(1);
  });