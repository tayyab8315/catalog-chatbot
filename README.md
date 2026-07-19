# LangGraph Product Catalog Chatbot

This repository contains a full-stack product catalog chatbot with a FastAPI + LangGraph backend and a React + Vite frontend. Users can ask natural-language catalog questions, the backend turns those requests into safe read-only Oracle queries, and the frontend renders the conversation as a polished chat experience.

## What The Project Does

- Accepts product-search requests in plain English
- Uses LangGraph tool-calling to decide when to query the catalog
- Generates parameterized Oracle `SELECT` queries from user intent
- Queries the `WEBUSG.SCRAPED_PRODUCTS` catalog table
- Returns conversational answers formatted in Markdown
- Preserves short-term chat context with `thread_id`

## Tech Stack

- Backend: FastAPI, LangGraph, LangChain, `langchain-ollama`, Oracle DB driver
- Frontend: React 18, Vite 5, Redux Toolkit, React Markdown
- Model integration: Ollama-compatible chat endpoint
- Database: Oracle

## Repository Structure

```text
.
|-- backend/
|   |-- app.py
|   |-- main.py
|   |-- pyproject.toml
|   |-- uv.lock
|   `-- services/
|       |-- chatBot.py
|       |-- llm.py
|       |-- quer_generation.py
|       |-- run_query.py
|       |-- state.py
|       `-- tools.py
|-- frontend/
|   |-- package.json
|   |-- vite.config.js
|   `-- src/
|       |-- api/
|       |-- app/
|       |-- components/
|       `-- features/
|-- .gitignore
`-- README.md
```

## Architecture

### Backend flow

1. The frontend sends `message` and `thread_id` to `POST /chat`.
2. [`backend/app.py`](/D:/Tayyab/AI/lang-graph-learning/LangGraphProject/backend/app.py:1) calls `runGraph(...)`.
3. [`backend/services/chatBot.py`](/D:/Tayyab/AI/lang-graph-learning/LangGraphProject/backend/services/chatBot.py:1) runs a LangGraph workflow with tool-calling and in-memory checkpointing.
4. The LLM calls `search_product_catalog(...)` when it needs catalog data.
5. [`backend/services/quer_generation.py`](/D:/Tayyab/AI/lang-graph-learning/LangGraphProject/backend/services/quer_generation.py:1) converts the request into one parameterized Oracle `SELECT` query.
6. [`backend/services/run_query.py`](/D:/Tayyab/AI/lang-graph-learning/LangGraphProject/backend/services/run_query.py:1) executes the query and returns structured rows.
7. The chatbot formats the results into a Markdown response for the UI.

### Frontend flow

1. The user types into the chat composer.
2. Redux dispatches the send-message thunk.
3. The app posts to `/api/chat`.
4. Vite proxies `/api/*` to `http://127.0.0.1:8000/*` during development.
5. The frontend normalizes `history.messages` and renders user and assistant bubbles.

## Key Features

- Multi-turn conversation support through persistent browser-side `thread_id`
- Markdown-rendered assistant responses, including tables and links
- Filtering of non-chat backend messages before rendering
- Merging of split assistant chunks into a cleaner single response bubble
- Read-only Oracle query generation with bind parameters
- Primary/secondary Oracle host failover in the query runner

## Prerequisites

### Backend

- Python 3.12+
- Oracle client libraries available locally
- Oracle database access credentials
- An Ollama-compatible chat model endpoint

### Frontend

- Node.js
- npm

## Environment Variables

Create `backend/.env` with the values required by the backend services.

### LLM settings

```env
OLLAMA_MODEL=gpt-oss:120b
OLLAMA_URL=https://your-ollama-compatible-endpoint
OLLAMA_API_KEY=your_api_key
```

### Oracle settings

```env
DB_USERNAME=your_username
DB_PASSWORD=your_password
DB_HOST_PRIMARY=your_primary_host
DB_HOST_SECONDARY=your_secondary_host
DB_PORT=1521
DB_SERVICE=your_service_name
ORACLE_LIB_DIR=C:\path\to\oracle\instantclient
```

## Local Setup

### 1. Start the backend

```powershell
cd backend
pip install -e .
python -m uvicorn app:app --reload
```

If your environment has multiple Python installations, using the virtualenv Python explicitly is safer:

```powershell
.\.venv\Scripts\python.exe -m uvicorn app:app --reload
```

The backend runs on `http://127.0.0.1:8000`.

### 2. Start the frontend

Open a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

The frontend runs on `http://127.0.0.1:5173`.

## API

### `GET /`

Returns:

```json
{
  "Hello": "World"
}
```

### `POST /chat`

Request:

```json
{
  "message": "Show me black Levi's jeans under GBP 80",
  "thread_id": "user-1-chat-1"
}
```

Current response shape:

```json
{
  "history": {
    "messages": []
  }
}
```

## Memory Model

- Conversation state is grouped by `thread_id`
- Reusing the same `thread_id` continues the same chat
- Memory is currently backed by LangGraph `MemorySaver`
- Memory is in-process only and is lost on server restart or code reload

## Important Files

- [`backend/app.py`](/D:/Tayyab/AI/lang-graph-learning/LangGraphProject/backend/app.py:1): FastAPI routes
- [`backend/services/chatBot.py`](/D:/Tayyab/AI/lang-graph-learning/LangGraphProject/backend/services/chatBot.py:1): LangGraph workflow and system prompt
- [`backend/services/tools.py`](/D:/Tayyab/AI/lang-graph-learning/LangGraphProject/backend/services/tools.py:1): tool definition used by the graph
- [`backend/services/quer_generation.py`](/D:/Tayyab/AI/lang-graph-learning/LangGraphProject/backend/services/quer_generation.py:1): Oracle SQL generation from natural language
- [`backend/services/run_query.py`](/D:/Tayyab/AI/lang-graph-learning/LangGraphProject/backend/services/run_query.py:1): Oracle execution layer
- [`frontend/src/App.jsx`](/D:/Tayyab/AI/lang-graph-learning/LangGraphProject/frontend/src/App.jsx:1): top-level chat layout
- [`frontend/src/features/chat/chatSlice.js`](/D:/Tayyab/AI/lang-graph-learning/LangGraphProject/frontend/src/features/chat/chatSlice.js:1): chat state and response normalization
- [`frontend/src/api/chatApi.js`](/D:/Tayyab/AI/lang-graph-learning/LangGraphProject/frontend/src/api/chatApi.js:1): API request logic and thread persistence
- [`frontend/vite.config.js`](/D:/Tayyab/AI/lang-graph-learning/LangGraphProject/frontend/vite.config.js:1): dev server and proxy setup

## Current Limitations

- Oracle access is required for real catalog results
- Chat memory is not persistent across backend restarts
- The root project does not yet include automated tests
- The generated SQL path is designed to be read-only, but additional validation could still be added before execution

## Troubleshooting

### Backend does not start

- Confirm `backend/.env` exists
- Confirm Oracle client libraries are installed and `ORACLE_LIB_DIR` is correct
- Confirm the configured Ollama-compatible endpoint is reachable

### Frontend cannot reach the backend

- Confirm FastAPI is running on port `8000`
- Confirm Vite is running on port `5173`
- Confirm the frontend is calling `/api/chat`

### Conversation context is missing

- Reuse the same `thread_id`
- Avoid restarting the backend if you need the current in-memory history

## Next Improvements

- Add persistent chat memory with SQLite or Postgres
- Add query validation before Oracle execution
- Add automated backend and frontend tests
- Render structured product cards in the UI
- Support response streaming
