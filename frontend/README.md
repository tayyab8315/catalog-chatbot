# Product Catalog Chatbot Frontend

React + Redux Toolkit frontend for a product catalog chatbot that talks to a FastAPI backend.

## Expected FastAPI response

The frontend assumes:

- `POST /chat`
- request body:

```json
{
  "message": "Show me laptops under $1000"
}
```

- response body:

```json
{
  "messages": [
    {
      "id": "1",
      "role": "user",
      "content": "Show me laptops under $1000",
      "timestamp": "2026-07-19T10:00:00Z"
    },
    {
      "id": "2",
      "role": "assistant",
      "content": "Here are a few options...",
      "timestamp": "2026-07-19T10:00:02Z"
    }
  ]
}
```

If your API shape is different, update `src/api/chatApi.js` and `src/features/chat/chatSlice.js`.

## Run

1. Install Node.js
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env`
4. Start dev server: `npm run dev`
