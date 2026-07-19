# LangGraph Product Catalog Backend

This backend provides the API and LangGraph workflow for the product catalog chatbot. It accepts user requests, turns them into safe read-only catalog queries through the model layer, executes those queries against Oracle, and returns the full conversation history.

## What This Backend Does

- Exposes a `POST /chat` endpoint for catalog questions
- Uses LangGraph with tool-calling and in-memory thread checkpointing
- Generates one parameterized Oracle `SELECT` query from user intent
- Queries `WEBUSG.SCRAPED_PRODUCTS`
- Returns the updated message history for the frontend to render

## Main Files

```text
backend/
|-- app.py
|-- main.py
|-- pyproject.toml
|-- uv.lock
`-- services/
    |-- chatBot.py
    |-- llm.py
    |-- quer_generation.py
    |-- run_query.py
    |-- state.py
    `-- tools.py
```

### File responsibilities

- `app.py`
  Starts FastAPI and exposes the API routes.
- `services/chatBot.py`
  Builds the LangGraph workflow, binds tools, and manages in-memory thread state.
- `services/tools.py`
  Defines the catalog tool the graph can call.
- `services/quer_generation.py`
  Prompts the model to generate one Oracle `SELECT` query plus bind parameters.
- `services/run_query.py`
  Initializes the Oracle client, connects to Oracle, and executes the generated query.
- `services/llm.py`
  Creates the Ollama-compatible chat client from environment variables.
- `main.py`
  Simple local placeholder entry point and not the main API server.

## Requirements

- Python 3.12+
- Oracle client libraries installed locally
- Oracle database credentials
- An Ollama-compatible chat endpoint

## Environment Variables

Create `backend/.env` with these values:

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

Notes:

- `OLLAMA_API_KEY` is required by the current code path.
- `DB_HOST_SECONDARY` is optional, but supported for failover.
- `ORACLE_LIB_DIR` is required by the current Oracle client initialization logic.

## Install Dependencies

From the `backend` directory:

```powershell
pip install -e .
```

## Run The API Server

From the `backend` directory:

```powershell
python -m uvicorn app:app --reload
```

If `uvicorn` resolves to the wrong interpreter on Windows, use the virtualenv Python explicitly:

```powershell
.\.venv\Scripts\python.exe -m uvicorn app:app --reload
```

## API Routes

### `GET /`

Returns:

```json
{
  "Hello": "World"
}
```

### `GET /items/{item_id}`

Sample route currently present in `app.py`:

```json
{
  "item_id": 1,
  "q": "example"
}
```

This route looks like a basic FastAPI demo/helper route rather than part of the chatbot contract.

### `POST /chat`

Request body:

```json
{
  "message": "Show me black Levi's jeans under GBP 80",
  "thread_id": "user-1-chat-1"
}
```

Important:

- The request field must be `thread_id`
- The backend uses `embed=True`, so the JSON body must include both top-level keys

Response behavior:

- The endpoint returns an object with a `history` field
- `history.messages` contains the conversation state returned by LangGraph
- The frontend reads and normalizes those messages before displaying them

## Memory Model

Conversation memory is currently handled with LangGraph `MemorySaver`.

Behavior:

- messages are grouped by `thread_id`
- using the same `thread_id` continues the same conversation
- using a different `thread_id` starts a separate conversation

Current limitation:

- memory is in-process only
- memory is lost when the server restarts
- memory is also lost on code reload while running with `--reload`

## High-Level Flow

1. The client sends `message` and `thread_id` to `/chat`.
2. `app.py` calls `runGraph(...)`.
3. `services/chatBot.py` invokes the graph with the configured thread id.
4. The graph can call `search_product_catalog(...)`.
5. `services/quer_generation.py` asks the model for an Oracle `SELECT` query and bind parameters.
6. `services/run_query.py` executes the query and returns structured rows.
7. The assistant formats the tool result into a final answer.

## Current Limitations

- There is no extra SQL validation layer before execution beyond the prompt constraints
- Oracle access and local Oracle client libraries are mandatory for real queries
- Logging is currently done with `print(...)`
- `services/state.py` is present but currently empty
- There are no automated tests yet

## Troubleshooting

### `OLLAMA_API_KEY` missing

Cause:

- `services/llm.py` raises an error if `OLLAMA_API_KEY` is not present

Fix:

- add `OLLAMA_API_KEY` to `backend/.env`

### Oracle client initialization fails

Check:

- `ORACLE_LIB_DIR` points to a valid Oracle Instant Client folder
- the folder is accessible on this machine

### Could not connect to Oracle database

Check:

- `DB_USERNAME`
- `DB_PASSWORD`
- `DB_HOST_PRIMARY`
- `DB_SERVICE`
- `DB_PORT`
- network reachability to the configured Oracle host

### Chat memory does not persist

This is expected with the current implementation because `MemorySaver` is in-memory only.
