# AI Tutor Backend

The backend provides the API, database models, service layer, Google Drive integration, tutoring session logic, chat message handling, and video generation workflow for AI Tutor Assistant.

## Setup

Install dependencies:

```bash
uv sync
```

Start the API:

```bash
uv run uvicorn app.main:app --reload --app-dir src --host localhost --port 3000
```

Start the MCP server:

```bash
PYTHONPATH=src uv run python -m app.mcp.server.main
```

API documentation is available at http://localhost:3000/docs when the server is running.

## Environment Variables

Authentication and provider values are intentionally blank in this showcase version.

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
MCP_SERVER=
FERNET_KEY=
OPENAI_KEY=
ELEVEN_KEY=
GEMINI_KEY=
```
