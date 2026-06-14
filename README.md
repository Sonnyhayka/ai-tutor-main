# AI Tutor Assistant

AI Tutor Assistant is a learning platform prototype for organizing courses, connecting study materials, asking AI assisted questions, and generating short educational videos from course content.

The project is structured as a FastAPI backend with a Next.js frontend. It includes modules for courses, files, tutoring sessions, chat messages, Google Drive integration, and video generation.

The frontend ships with a built-in **demo mode** so it can be deployed and explored on its own (for example on Vercel) without a backend or any credentials. See [Demo Mode](#demo-mode) and [Deploy to Vercel](#deploy-to-vercel-frontend-showcase).

## Technology Stack

Backend: FastAPI, Python, SQLAlchemy, Gemini, OpenAI, ElevenLabs

Frontend: Next.js, TypeScript, Tailwind CSS, React Context

Infrastructure: Docker, GitHub Actions

## Local Development

### Prerequisites

1. Python 3.11 or newer
2. Node.js 20 or newer
3. uv
4. Docker, optional

### Backend

```bash
cd backend
uv sync
uv run uvicorn app.main:app --reload --app-dir src --host localhost --port 3000
```

### MCP Server

Run this in a separate terminal.

```bash
cd backend
PYTHONPATH=src uv run python -m app.mcp.server.main
```

### Frontend

Run this in a separate terminal.

```bash
cd frontend
npm install
npm run dev -- -p 5173
```

Application URLs:

1. Frontend: http://localhost:5173
2. Backend API: http://localhost:3000
3. API documentation: http://localhost:3000/docs

## Docker

```bash
docker-compose build
docker-compose up -d
docker-compose down
```

## Demo Mode

The frontend automatically runs in demo mode whenever `NEXT_PUBLIC_API_URL` is not set. In this mode every API call is served by an in-memory mock layer (`frontend/lib/mockData.ts`) instead of the backend, so the full UI is interactive with no server, database, or API keys:

1. Log in or sign up with any values to enter the app.
2. Browse seeded classes, documents, tutor sessions, and generated videos.
3. Create and delete classes, search a mock Google Drive, send chat messages (the tutor replies with canned responses), and generate sample videos.

Demo data lives in memory and resets on a page refresh. Setting `NEXT_PUBLIC_API_URL` to a running backend disables demo mode and switches the app to live data.

## Deploy to Vercel (Frontend Showcase)

The Next.js frontend deploys to Vercel as a standalone demo with no environment variables.

1. Push this repository to GitHub.
2. In Vercel, import the repository and set the project **Root Directory** to `frontend`.
3. Leave the environment variables empty. With no `NEXT_PUBLIC_API_URL`, the build runs in demo mode.
4. Deploy. Vercel auto-detects Next.js and builds the project.

To point the deployment at a real backend later, add `NEXT_PUBLIC_API_URL` in the Vercel project settings and redeploy.

## Environment Variables

Create a `.env` file for local development. Authentication values are intentionally left blank in this showcase version. For the frontend, `NEXT_PUBLIC_API_URL` is optional and only needed to connect to a live backend (see [Demo Mode](#demo-mode)). A `frontend/.env.example` is included as a template.

```env
ENVIRONMENT=
DATABASE_URL=
SECRET_KEY=
SESSION_SECRET=
CORS_ORIGINS=

CLIENT_ID=
CLIENT_SECRET=
REDIRECT_URI=
TOKEN_URI=
PROJECT_ID=

GEMINI_KEY=
OPENAI_KEY=
ELEVEN_KEY=
FERNET_KEY=

FRONTEND_URL=
BACKEND_URL=
MCP_SERVER=
NEXT_PUBLIC_API_URL=
```

## Project Structure

```text
backend/
  src/app/api/
  src/app/core/
  src/app/models/
  src/app/repository/
  src/app/routes/
  src/app/schemas/
  src/app/services/
frontend/
  app/
  components/
  contexts/
  hooks/
  lib/
```

## Notes

This repository is prepared for portfolio review. Credential values, provider identifiers, and personal authentication examples have been removed.
