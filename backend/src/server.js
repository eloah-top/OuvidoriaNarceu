import { createApp } from './app.js';
import { env } from './config/env.js';
import { initDatabase } from './db.js';

const app = createApp();

initDatabase()
  .then(() => {
    app.listen(env.port, () => {
      console.log(`[backend] rodando em http://localhost:${env.port} (${env.nodeEnv})`);
    });
  })
  .catch((err) => {
    console.error('[backend] falha ao iniciar banco:', err);
    process.exit(1);
  });
