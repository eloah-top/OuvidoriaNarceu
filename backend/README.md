# OuvidoriaNarceu — Backend (modelo Express)

## Rodar

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

- API: `http://localhost:3000/api`
- Health: `GET /api/health`
- Exemplo CRUD: `/api/manifestacoes`

## Estrutura

```
src/
  server.js       # bootstrap (listen)
  app.js          # cria app, middlewares, rotas
  config/env.js
  routes/
    index.js
    health.routes.js
    manifestacoes.routes.js
  controllers/
    manifestacoes.controller.js  # em memória, trocar por DB
  middlewares/
    notFound.js
    errorHandler.js
```

## Próximos passos
- Ligar banco (Prisma + Postgres)
- Auth JWT + validação com Zod
- Testes com node:test + supertest
