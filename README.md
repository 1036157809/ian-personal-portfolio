# Ian's Personal Portfolio Website

A modern, bilingual personal portfolio website for a frontend engineer, built with Vue 3 + TypeScript (frontend) and Koa + Sequelize + MySQL + TypeScript (backend). Deployed via Docker Compose.

## Features

- **Bilingual Support**: Chinese/English language switching (vue-i18n)
- **Automatic Theme Switching**: Day/Night theme based on device time (6 AM - 6 PM)
  - Day theme: Blue-sand gradient
  - Night theme: Deep space blue-purple
- **Project Showcase**: Dynamic project display from backend API
- **AI Chat Assistant**: RAG-powered chat with knowledge base (ChromaDB + LongCat LLM), SSE streaming
- **Aviation Map**: Real-time flight tracking with OpenLayers + OpenSky API
- **File Converter**: Markdown/Word/HTML to PDF conversion with CJK font support
- **Demos**: Music visualization, data portal, Shougang data analysis, football analytics

## Tech Stack

### Frontend
- Vue 3.5 (Composition API) + Vite 8 + TypeScript 6
- Pinia 3 (state management)
- Vue Router 5 (lazy loading)
- vue-i18n 11 (internationalization)
- Tailwind CSS 4 (styling)
- ECharts 6, OpenLayers 10, Three.js, jsPDF, Marked, Mammoth
- Vitest 4 + Playwright (testing)

### Backend
- Koa 3 + @koa/router 15 + koa-body 8 + TypeScript 6
- MySQL 8.0 + Sequelize 6 (ORM)
- LongCat API (OpenAI-compatible LLM)
- ChromaDB (vector database for RAG)
- node-cron (scheduled tasks)
- Vitest 4 (testing)

### Infrastructure
- Docker + Docker Compose
- Nginx (reverse proxy + static file serving)
- Turborepo (monorepo orchestration)
- pnpm 10 (package management)

## Project Structure

```
ian-personal-portfolio/
├── apps/
│   ├── frontend/          # Vue 3 frontend
│   │   ├── src/
│   │   │   ├── views/     # Page views
│   │   │   ├── stores/    # Pinia stores (theme, language)
│   │   │   ├── router/    # Vue Router config
│   │   │   ├── i18n/      # Internationalization
│   │   │   ├── ai-assistant/  # AI chat module
│   │   │   └── components/
│   │   ├── public/fonts/  # Subset NotoSansSC (~182KB TTF)
│   │   ├── Dockerfile
│   │   └── nginx.conf
│   └── backend/           # Koa backend
│       ├── src/
│       │   ├── app/       # App initialization + DB migration
│       │   ├── routes/    # Route registration
│       │   ├── controllers/
│       │   ├── services/
│       │   ├── models/    # Sequelize models
│       │   ├── middlewares/
│       │   ├── ai-assistant/  # RAG pipeline
│       │   └── config/    # DB + logger config
│       ├── Dockerfile
│       └── .env.production.example
├── packages/
│   └── shared/            # Shared types, constants, validators
├── docker-compose.yml
├── turbo.json
├── tsconfig.base.json
├── pnpm-workspace.yaml
└── .env.example           # Environment variable template
```

## Prerequisites

- Node.js 20+ 
- pnpm 10+
- Docker + Docker Compose
- MySQL 8.0 (via Docker)

## Quick Start

### Environment Setup

1. Create `.env` from the example:
```bash
cp .env.example .env
```

2. Configure the required environment variables in `.env`:
```env
# Frontend build args (docker-compose reads these)
VITE_TIANDITU_TOKEN=your_tianditu_token
VITE_API_BASE_URL=/api

# Backend runtime (loaded by docker-compose env_file or .env.production)
ANTHROPIC_AUTH_TOKEN=your_longcat_api_key
LLM_BASE_URL=https://api.longcat.chat/openai/v1
LLM_MODEL=LongCat-2.0-Preview
CHROMADB_API_KEY=your_chromadb_api_key
CHROMADB_HOST=api.trychroma.com
CHROMADB_TENANT=your_tenant_id
CHROMADB_DATABASE=your_database_name
OPENSKY_CLIENT_ID=your_opensky_client_id
OPENSKY_CLIENT_SECRET=your_opensky_client_secret
```

### Docker Deployment (Production)

```bash
docker compose up --build -d
```

This starts three containers:
- **mysql**: MySQL 8.0 with persistent volume
- **backend**: Koa API server on port 3001
- **frontend**: Nginx serving static files on ports 80/443

### Local Development

```bash
# Install dependencies
pnpm install

# Start all services (Turborepo)
pnpm dev

# Or start individually:
pnpm --filter @ianportfolio/frontend run dev  # localhost:3000
pnpm --filter @ianportfolio/backend run dev   # localhost:3001
```

### Testing

```bash
pnpm --filter @ianportfolio/frontend run test  # Frontend unit tests
pnpm --filter @ianportfolio/backend run test   # Backend unit tests
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/` | Health check |
| `POST` | `/api/file/upload` | File upload |
| `GET` | `/api/file/:id/download` | File download |
| `GET` | `/api/opensky/states` | Aviation data proxy |
| `POST` | `/api/visitor/log` | Visitor tracking |
| `GET` | `/api/config/:key` | System config |
| `POST` | `/api/chat/send` | AI chat (SSE streaming) |

## RAG Pipeline (AI Assistant)

```
Document → Chunker (600 chars, 100 overlap)
         → Embedding (OpenAI-compatible API)
         → ChromaDB (vector storage)
         → Indexing (retrieve top-5 with language filter)
         → Chat (RAG-enhanced, SSE streaming)
         → Rate Limit (100 calls/day, resets at midnight)
```

## Theme System

- **Day Mode**: 6:00 AM - 5:59 PM (auto-detect)
- **Night Mode**: 6:00 PM - 5:59 AM
- Manual toggle via navbar button

## Building for Production

```bash
# Full monorepo build
pnpm build

# Individual packages
pnpm --filter @ianportfolio/shared build
pnpm --filter @ianportfolio/frontend build
pnpm --filter @ianportfolio/backend build
```

## Environment Variables

### Frontend (build-time, VITE_ prefix)
| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_TIANDITU_TOKEN` | Tianditu map token | — |
| `VITE_API_BASE_URL` | Backend API base URL | `/api` |

### Backend (runtime)
| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `production` |
| `DB_HOST` | MySQL host | `mysql` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_USER` | MySQL user | `portfolio` |
| `DB_PASSWORD` | MySQL password | `portfolio` |
| `DB_NAME` | MySQL database | `portfolio` |
| `OPENSKY_CLIENT_ID` | OpenSky API client ID | — |
| `OPENSKY_CLIENT_SECRET` | OpenSky API client secret | — |
| `ANTHROPIC_AUTH_TOKEN` | LLM API key (LongCat) | — |
| `LLM_BASE_URL` | LLM API base URL | — |
| `LLM_MODEL` | LLM model name | `LongCat-2.0-Preview` |
| `LLM_MAX_TOKENS` | Max tokens per request | `1024` |
| `CHROMADB_API_KEY` | ChromaDB API key | — |
| `CHROMADB_HOST` | ChromaDB host | `api.trychroma.com` |
| `CHROMADB_TENANT` | ChromaDB tenant ID | — |
| `CHROMADB_DATABASE` | ChromaDB database | — |
| `CHROMADB_COLLECTION` | ChromaDB collection | `portfolio-knowledge` |
| `CHUNK_MAX_SIZE` | RAG chunk size | `600` |
| `CHUNK_OVERLAP` | RAG chunk overlap | `100` |
| `RETRIEVE_TOP_K` | RAG retrieval count | `5` |
| `VISITOR_SALT` | Visitor IP hash salt | — |
| `ADMIN_SECRET` | Admin API secret | — |

## License

ISC
