# OuvidoriaNarceu

[![Node.js](https://img.shields.io/badge/node-%3E%3D18-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/vite-8-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Express](https://img.shields.io/badge/express-4-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Sequelize](https://img.shields.io/badge/sequelize-6-52B0E7?logo=sequelize&logoColor=white)](https://sequelize.org/)

Sistema web **full-stack** de ouvidoria escolar para a **Escola Estadual NARCEU (Narceu de
Paiva Filho)**. Permite que estudantes, pais e comunidade registrem manifestações
(denúncia, reclamação, sugestão, elogio e solicitação) direcionadas aos setores da escola
(Direção, Pedagógico, Secretaria, APOIE e Tutor), de forma identificada ou anônima, com
geração de protocolo para acompanhamento e resposta pelo setor responsável.

> Repositório: [`bernardosgtmatos/OuvidoriaNarceu`](https://github.com/bernardosgtmatos/OuvidoriaNarceu)

---

## Sumário

- [Sobre o projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Stack](#stack)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Pré-requisitos](#pré-requisitos)
- [Instalação e execução local](#instalação-e-execução-local)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Endpoints da API](#endpoints-da-api)
- [Banco de dados](#banco-de-dados)
- [Scripts disponíveis](#scripts-disponíveis)
- [Testes](#testes)
- [Telas e rotas](#telas-e-rotas)
- [Contribuição](#contribuição)
- [Licença](#licença)
- [Autor](#autor)

---

## Sobre o projeto

**OuvidoriaNarceu** é um portal de ouvidoria escolar que centraliza o registro e o
acompanhamento de manifestações. O backend expõe uma API REST em Express com persistência
via Sequelize (SQLite em desenvolvimento, Postgres em produção), geração de protocolo único
(`NRC-AAAA-XXXXXXXX`) e envio de e-mail ao responsável do setor informado. O frontend é uma
SPA em React servida por Vite, com um assistente em etapas para registro da manifestação e
consulta de protocolo.

## Funcionalidades

- **Registro de manifestação em etapas**: identificação → tipo → setor → dados → confirmação.
- **Identificação opcional**: manifestação identificada (nome e turma) ou anônima.
- **Tipos de manifestação**: denúncia, reclamação, sugestão, elogio, solicitação.
- **Setores de destino**: Direção, Pedagógico, Secretaria, APOIE, Tutor.
- **Protocolo único**: gerado automaticamente no formato `NRC-AAAA-XXXXXXXX`.
- **Consulta por protocolo**: visualização do status e da resposta do setor.
- **Acompanhamento**: status `aberta`, `em_analise`, `respondida`, `concluida`, `arquivada`
  e resposta registrada pelo setor responsável.
- **Listagem administrativa**: filtros por status, tipo, setor e busca por título,
  descrição ou protocolo, com paginação (`limit`/`offset`).
- **Notificação por e-mail**: envio ao responsável do setor (nodemailer), com log de
  fallback quando o SMTP não está configurado.
- **Health check**: `GET /api/health` com status do serviço e do banco de dados.
- **Segurança básica**: Helmet, CORS configurável e logging com Morgan.

## Stack

### Backend (`backend/`)

| Tecnologia | Uso |
|---|---|
| Node.js (>=18) + Express 4 | Servidor HTTP e rotas |
| Sequelize 6 | ORM |
| sqlite3 (dev) / pg (prod) | Banco de dados |
| nodemailer | Envio de e-mail ao setor responsável |
| helmet, cors, morgan, dotenv | Middlewares e configuração |

### Frontend (`frontend/`)

| Tecnologia | Uso |
|---|---|
| React 19 + React Router 7 | UI e roteamento |
| Vite 8 | Build e servidor de desenvolvimento |
| Oxlint | Lint |

## Estrutura do projeto

```text
OuvidoriaNarceu/
├── backend/
│   ├── src/
│   │   ├── server.js                 # bootstrap (listen)
│   │   ├── app.js                    # cria app, middlewares, rotas
│   │   ├── db.js                     # init do banco (sync)
│   │   ├── config/                   # env e database (SQLite/Postgres)
│   │   ├── models/                   # modelo Manifestacao
│   │   ├── controllers/              # lógica de negócio
│   │   ├── routes/                   # health e manifestacoes
│   │   ├── services/                 # envio de e-mail
│   │   └── middlewares/              # notFound, errorHandler
│   ├── .env.example
│   ├── nodemon.json
│   └── package.json
├── frontend/
│   └── src/
│       ├── App.jsx                   # rotas
│       ├── components/               # Header, Footer, Layout
│       ├── lib/api.js                # cliente HTTP
│       └── pages/                    # Home, NovaManifestacao, ConsultarProtocolo, Manifestacao
├── documentação/                     # requisitos da documentação do TCC
├── package.json                      # scripts agregados (dev, build)
└── README.md
```

## Pré-requisitos

- [Node.js](https://nodejs.org/) >= 18
- npm (vem com o Node)
- Git
- (Opcional, produção) banco Postgres e SMTP para envio de e-mails

## Instalação e execução local

### Raiz (backend + frontend em paralelo)

```bash
npm install
npm run dev
```

### Backend

```bash
cd backend
cp .env.example .env   # ajuste PORT, SMTP_* etc.
npm install
npm run dev            # http://localhost:3000
```

API em `http://localhost:3000/api`. Banco SQLite em `backend/data/ouvidoria.sqlite`.

### Frontend

```bash
cd frontend
cp .env.example .env.local   # VITE_API_URL=/api (padrão, usa proxy do Vite)
npm install
npm run dev                  # http://localhost:5173
npm run build                # gera dist/
```

Em desenvolvimento o Vite faz proxy de `/api` para `http://localhost:3000`.

## Variáveis de ambiente

### Backend (`backend/.env`)

| Variável | Descrição |
|---|---|
| `PORT` | Porta do servidor (padrão 3000) |
| `NODE_ENV` | `development` ou `production` |
| `CORS_ORIGIN` | Origem(s) permitidas (vírgula) ou `*` |
| `DB_STORAGE` | Caminho do SQLite (padrão `./data/ouvidoria.sqlite`) |
| `DATABASE_URL` | Postgres; se vazio usa SQLite local |
| `DATABASE_DIALECT` | Dialeto quando `DATABASE_URL` definido (padrão `postgres`) |
| `DB_SSL` | `true` para SSL no Postgres |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_SECURE` | Configuração SMTP |
| `SMTP_USER` / `SMTP_PASS` / `SMTP_FROM` | Credenciais e remetente do e-mail |
| `EMAIL_DIRECAO` / `EMAIL_PEDAGOGICO` / `EMAIL_SECRETARIA` / `EMAIL_APOIE` / `EMAIL_TUTOR` | Destinatário por setor |

### Frontend (`frontend/.env.local`)

| Variável | Descrição |
|---|---|
| `VITE_API_URL` | URL base da API (dev: `/api`; prod: URL do backend) |

## Endpoints da API

Base: `http://localhost:3000/api`.

### Sistema

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/` | Informações da API (nome e versão) |
| `GET` | `/health` | Status do serviço e do banco (`{ status, db, uptime }`) |

### Manifestações (`/manifestacoes`)

| Método | Rota | Descrição |
|---|---|---|
| `GET` | `/manifestacoes` | Listar (filtros: `status`, `tipo`, `setor`, `q`; paginação: `limit`, `offset`) |
| `GET` | `/manifestacoes/protocolo/:protocolo` | Buscar por protocolo |
| `GET` | `/manifestacoes/:id` | Buscar por id |
| `POST` | `/manifestacoes` | Criar manifestação (gera protocolo) |
| `PUT` | `/manifestacoes/:id` | Atualizar (status, resposta, campos) |
| `DELETE` | `/manifestacoes/:id` | Excluir manifestação |

## Banco de dados

Tabela principal: `manifestacoes`.

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | INTEGER (PK, auto) | Identificador |
| `protocolo` | VARCHAR(32), único | Protocolo `NRC-AAAA-XXXXXXXX` |
| `tipo` | ENUM | `denuncia`, `reclamacao`, `sugestao`, `elogio`, `solicitacao` |
| `titulo` | VARCHAR(200) | Assunto (mín. 3 caracteres) |
| `descricao` | TEXT | Descrição (mín. 5 caracteres) |
| `setor` | ENUM (nullable) | `direcao`, `pedagogico`, `secretaria`, `apoie`, `tutor` |
| `turma` | VARCHAR(50) (nullable) | Turma (máx. 10 caracteres) |
| `nome` | VARCHAR(120) (nullable) | Nome do manifestante |
| `contato` | VARCHAR(120) (nullable) | Contato |
| `anonimo` | BOOLEAN | Se a manifestação é anônima |
| `status` | ENUM | `aberta`, `em_analise`, `respondida`, `concluida`, `arquivada` |
| `resposta` | TEXT (nullable) | Resposta do setor |
| `respondedAt` | DATE (nullable) | Data da resposta |
| `createdAt` / `updatedAt` | DATE | Timestamps automáticos |

**Observações:**
- Em desenvolvimento usa SQLite (`backend/data/ouvidoria.sqlite`); em produção usa
  Postgres via `DATABASE_URL`.
- A inicialização remove a tabela legada `turmas` e sincroniza o modelo (`sequelize.sync()`).
- O estoque/capacidade não se aplica a este projeto (ouvidoria).

## Scripts disponíveis

### Raiz (`package.json`)

| Script | Descrição |
|---|---|
| `npm run dev` | Inicia backend e frontend em paralelo |
| `npm run dev:backend` | Apenas backend |
| `npm run dev:frontend` | Apenas frontend |
| `npm run start:backend` | Backend em produção |
| `npm run build:frontend` | Build do frontend |

### Backend (`backend/package.json`)

| Script | Descrição |
|---|---|
| `npm start` | Inicia o servidor (`node src/server.js`) |
| `npm run dev` | Desenvolvimento com nodemon |
| `npm test` | Executa `node --test` (sem suíte definida atualmente) |

### Frontend (`frontend/package.json`)

| Script | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento Vite |
| `npm run build` | Build de produção |
| `npm run lint` | Oxlint |
| `npm run preview` | Preview do build |

## Testes

Não há suíte de testes automatizados configurada. Testes manuais realizados nas principais
funcionalidades:

| Funcionalidade | Procedimento | Resultado esperado | Resultado |
|---|---|---|---|
| Home | Acessar `/` | Página inicial com setores e contatos | OK |
| Nova manifestação | Preencher etapas e enviar | Protocolo gerado e exibido | OK |
| Manifestação anônima | Marcar anônimo e enviar | Sem nome/turma no registro | OK |
| Validação | Enviar com título < 3 chars | Erro de validação (HTTP 400) | OK |
| Consulta de protocolo | Informar protocolo válido | Dados da manifestação exibidos | OK |
| Protocolo inexistente | Informar protocolo inválido | Mensagem de não encontrado (HTTP 404) | OK |
| Visualização | Abrir `/manifestacao/:protocolo` | Detalhes e status exibidos | OK |
| Health check | `GET /api/health` | `{ status: "ok", db: "ok" }` | OK |
| Listagem com filtros | `GET /api/manifestacoes?status=...` | Lista filtrada | OK |
| Atualização | `PUT /api/manifestacoes/:id` com resposta | Status `respondida` e resposta salva | OK |
| Exclusão | `DELETE /api/manifestacoes/:id` | HTTP 204 | OK |

## Telas e rotas

Rotas do frontend (SPA):

| Rota | Descrição | Acesso |
|---|---|---|
| `/` | Página inicial (setores, horários, contatos) | Público |
| `/nova` | Registro de nova manifestação (assistente em etapas) | Público |
| `/consultar` | Consulta de protocolo | Público |
| `/manifestacao/:protocolo` | Visualização da manifestação e resposta | Público |

## Contribuição

1. Faça um fork do projeto.
2. Crie uma branch para sua feature: `git checkout -b feat/minha-feature`.
3. Commit suas mudanças: `git commit -m "feat: descrição"`.
4. Push para a branch: `git push origin feat/minha-feature`.
5. Abra um Pull Request.

## Licença

Não há licença declarada no repositório. Consulte os mantenedores antes de reutilizar o
código.

## Autor

Desenvolvido por **Lorena e Eloah**. Repositório mantido por
[@bernardosgtmatos](https://github.com/bernardosgtmatos) (upstream:
[eloah-top/OuvidoriaNarceu](https://github.com/eloah-top/OuvidoriaNarceu)).

---

> Requisitos da documentação técnica do TCC disponíveis em
> `documentação/requisistos para a documentação`.
