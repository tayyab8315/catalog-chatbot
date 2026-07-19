# LangGraph Product Catalog Backend

This project is a FastAPI backend for a product-catalog chatbot built with LangGraph, LangChain, and an Ollama-compatible chat model. The chatbot accepts natural-language product requests, converts them into a safe read-only Oracle SQL query, runs that query against the catalog, and returns a conversational response.

## What This Backend Does

- Exposes a `/chat` API endpoint for catalog questions
- Uses a LangGraph workflow with tool-calling
- Generates read-only Oracle `SELECT` queries from user intent
- Queries the `WEBUSG.SCRAPED_PRODUCTS` catalog table
- Keeps short-term conversation memory by `thread_id` during the current server process

## Project Structure

```text
backend/
|-- app.py
|-- pyproject.toml
|-- services/
|   |-- chatBot.py
|   |-- llm.py
|   |-- quer_generation.py
|   |-- run_query.py
|   `-- tools.py
`-- .env
```

## Main Files

- `app.py`
  - Starts the FastAPI app
  - Exposes the `/chat` endpoint
- `services/chatBot.py`
  - Builds the LangGraph workflow
  - Adds tool-calling and in-memory conversation state
- `services/tools.py`
  - Defines the catalog search tool used by the graph
- `services/quer_generation.py`
  - Turns a user requirement into a safe Oracle `SELECT` query plus bind params
- `services/run_query.py`
  - Executes the generated SQL against Oracle
- `services/llm.py`
  - Creates the Ollama-compatible chat model client from environment variables

## Requirements

- Python 3.12+
- A working virtual environment
- An Ollama-compatible model endpoint
- Oracle database access for the catalog query layer

## Environment Variables

Create a `.env` file in the backend folder with the values used by `services/llm.py` and your database layer.

LLM variables currently used by the code:

```env
OLLAMA_MODEL=gpt-oss:120b
OLLAMA_URL=https://your-ollama-compatible-endpoint
OLLAMA_API_KEY=your_api_key
```

If your Oracle query runner needs additional variables, add them to `.env` as required by `services/run_query.py`.

## Install Dependencies

If you are using the existing virtual environment:

```powershell
.\.venv\Scripts\Activate.ps1
```

If dependencies are not installed yet:

```powershell
pip install -e .
```

## Run the Server

Use the virtualenv Python explicitly to avoid the `uvicorn` path issue:

```powershell
.\.venv\Scripts\python.exe -m uvicorn app:app --reload
```

Do not rely on plain:

```powershell
uvicorn app:app --reload
```

On this machine, `uvicorn` may resolve to a different global executable instead of the one inside `.venv`.

## API Endpoints

### `GET /`

Simple health-style response:

```json
{
  "Hello": "World"
}
```

### `POST /chat`

Send a user message and a `thread_id`.

Request body:

```json
{
  "message": "Show me black Levi's jeans under GBP 80",
  "thread_id": "user-1-chat-1"
}
```

Important:

- The field name must be `thread_id`
- `thread_d` is incorrect and will fail validation

Example response shape:

```json
{
  "history": {
    "messages": []
  }
}
```

## How Memory Works

Conversation memory is currently handled with LangGraph `MemorySaver`.

Behavior:

- Memory is grouped by `thread_id`
- Messages with the same `thread_id` share conversation context
- Messages with different `thread_id` values are treated as separate conversations

Current limitation:

- `MemorySaver` is in-memory only
- Memory is lost when the server restarts
- Memory is also lost when code reloads happen under `--reload`

If persistent memory is needed, replace `MemorySaver` with a persistent checkpointer such as SQLite or Postgres.

## High-Level Flow

1. The client sends `message` and `thread_id` to `/chat`.
2. `app.py` calls `runGraph(...)`.
3. `services/chatBot.py` invokes the LangGraph workflow.
4. The LLM decides when to call the catalog tool.
5. `services/tools.py` calls the query generator.
6. `services/quer_generation.py` creates a safe Oracle `SELECT` query and bind params.
7. The query is executed and returned to the graph.
8. The chatbot formats the result into a user-facing response.

## Notes

- The chatbot is designed for product-catalog questions
- The SQL generator is intended to produce read-only queries only
- The current README documents the backend only
- The file `services/quer_generation.py` is named `quer_generation.py` in the project as it exists today

## Common Issues

### 1. `Failed to canonicalize script path`

Cause:
- The wrong `uvicorn` executable is being used

Fix:

```powershell
.\.venv\Scripts\python.exe -m uvicorn app:app --reload
```

### 2. Chat memory does not seem to work

Check the following:

- You are sending the same `thread_id` across follow-up messages
- The server process has not restarted
- You are not assuming `MemorySaver` is persistent storage

### 3. FastAPI says `thread_id` is missing

Cause:
- The request body uses the wrong field name

Correct request:

```json
{
  "message": "what will be 10 + 2929",
  "thread_id": "23821y382"
}
```
