# LangGraph Product Catalog Chatbot

This repository contains a full-stack product catalog chatbot with a FastAPI + LangGraph backend and a React + Vite frontend. Users can ask natural-language catalog questions, the backend turns those requests into safe read-only Oracle queries, and the frontend renders the conversation as a chat interface.

## Overview

The project is split into two apps:

- `backend/`: FastAPI API plus LangGraph workflow, LLM integration, and Oracle query execution
- `frontend/`: React client with Redux Toolkit state, markdown chat rendering, and Vite dev proxying

The chatbot is designed for catalog-style requests such as:

- finding products by brand, fit, category, colour, or size
- comparing matching products
- filtering by price or currency
- continuing follow-up questions in the same chat thread

## Tech Stack

- Backend: FastAPI, LangGraph, LangChain, `langchain-ollama`, `oracledb`, `python-dotenv`
- Frontend: React 18, Vite 5, Redux Toolkit, React Redux, React Markdown, `remark-gfm`
- Model integration: Ollama-compatible chat endpoint
- Data source: Oracle table `WEBUSG.SCRAPED_PRODUCTS`

## Repository Structure

```text
.
|-- backend/
|   |-- app.py
|   |-- main.py
|   |-- pyproject.toml
|   |-- README.md
|   |-- uv.lock
|   `-- services/
|       |-- chatBot.py
|       |-- llm.py
|       |-- quer_generation.py
|       |-- run_query.py
|       |-- state.py
|       `-- tools.py
|-- frontend/
|   |-- index.html
|   |-- package.json
|   |-- README.md
|   |-- vite.config.js
|   `-- src/
|       |-- api/
|       |-- app/
|       |-- components/
|       |-- features/
|       |-- App.jsx
|       |-- main.jsx
|       `-- styles.css
|-- .gitignore
`-- README.md
```

## How It Works

### Backend flow

1. The frontend sends `message` and `thread_id` to `POST /chat`.
2. `backend/app.py` forwards the request to the LangGraph runner.
3. `backend/services/chatBot.py` builds the graph and injects the system prompt.
4. The LLM decides when to call the catalog search tool.
5. `backend/services/quer_generation.py` turns the request into one parameterized Oracle `SELECT` query.
6. `backend/services/run_query.py` runs the query against Oracle and returns structured results.
7. The assistant formats the answer in Markdown for the frontend.

### Frontend flow

1. The user writes a message in the chat composer.
2. Redux dispatches the async send action.
3. The frontend sends a request to `/api/chat`.
4. Vite proxies `/api/*` to the FastAPI backend during local development.
5. The frontend normalizes the returned history and renders user and assistant messages.

## Quick Start

### Backend

```powershell
cd backend
pip install -e .
python -m uvicorn app:app --reload
```

If you are using a local virtual environment, this is safer on Windows:

```powershell
.\.venv\Scripts\python.exe -m uvicorn app:app --reload
```

Backend default URL: `http://127.0.0.1:8000`

### Frontend

Open a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Frontend default URL: `http://127.0.0.1:5173`

## Required Backend Environment Variables

Create `backend/.env` with values like these:

```env
OLLAMA_MODEL=gpt-oss:120b
OLLAMA_URL=https://your-ollama-compatible-endpoint
OLLAMA_API_KEY=your_api_key
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_HOST_PRIMARY=your_primary_host
DB_HOST_SECONDARY=your_secondary_host
DB_PORT=1521
DB_SERVICE=your_service_name
ORACLE_LIB_DIR=C:\path\to\oracle\instantclient
```

## API Summary

### `GET /`

Returns:

```json
{
  "Hello": "World"
}
```

### `POST /chat`

Request body:

```json
{
  "message": "Show me black Levi's jeans under GBP 80",
  "thread_id": "user-1-chat-1"
}
```

The response includes conversation history under `history.messages`.

## Current Limitations

- Oracle access is required for real catalog results
- Chat history is stored in memory only and is lost on backend restart
- The backend currently relies on the model to produce safe read-only SQL and does not add a second validation layer before execution
- There are no automated tests in the repo yet

## Read More

- `backend/README.md` for backend setup and API details
- `frontend/README.md` for frontend behavior and local development notes
