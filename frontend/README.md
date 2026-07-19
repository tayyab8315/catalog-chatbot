# Product Catalog Chatbot Frontend

Frontend for a product catalog chatbot built with React, Vite, and Redux Toolkit. The app connects to a FastAPI backend, sends user messages with a persistent `thread_id`, and renders the updated chat history returned by the API.

## Overview

This frontend is designed for a shopping or catalog assistant use case where users can:

- ask for products by brand, department, style, fit, or price
- continue a multi-turn conversation using the same backend thread
- view markdown-formatted bot replies including headings, lists, tables, and links
- browse long chat histories in a scrollable message area with a fixed composer

## Tech Stack

- React 18
- Vite 5
- Redux Toolkit
- React Redux
- React Markdown
- Remark GFM for GitHub-flavored markdown tables and lists

## Features

- Chat UI with fixed textarea and send button at the bottom
- Scrollable messages area
- Redux-based chat state management
- Persistent `thread_id` stored in browser `localStorage`
- Markdown rendering for assistant responses
- GitHub-flavored markdown table support
- Vite dev proxy for local FastAPI integration
- Filtering and normalization of backend history messages before display
- Merge of split sequential assistant chunks into a single bubble for cleaner output

## Project Structure

```text
frontend/
+-- src/
¦   +-- api/
¦   ¦   +-- chatApi.js
¦   +-- app/
¦   ¦   +-- store.js
¦   +-- components/
¦   ¦   +-- ChatHeader.jsx
¦   ¦   +-- ChatInput.jsx
¦   ¦   +-- ChatMessages.jsx
¦   ¦   +-- MessageBubble.jsx
¦   +-- features/
¦   ¦   +-- chat/
¦   ¦       +-- chatSlice.js
¦   +-- App.jsx
¦   +-- main.jsx
¦   +-- styles.css
+-- .env.example
+-- index.html
+-- package.json
+-- README.md
+-- vite.config.js
```

## How It Works

1. The user types a message in the chat box.
2. Redux dispatches the `sendMessage` async thunk.
3. The frontend sends a `POST` request to the FastAPI chat endpoint.
4. A persistent `thread_id` is included with each request.
5. The backend returns conversation history.
6. The frontend normalizes the history and renders it as chat bubbles.

## API Integration

### Development request path

During local development, the browser calls:

```text
/api/chat
```

Vite proxies that request to the FastAPI backend configured in `vite.config.js`.

### FastAPI target used in development

```text
http://127.0.0.1:8000/chat
```

## Request Payload

The frontend sends this payload to the backend:

```json
{
  "message": "add 22666 into previous total",
  "thread_id": "23821y382"
}
```

### Notes

- `message` is the user input from the textarea.
- `thread_id` is reused across messages so the backend can keep context.
- If no thread id exists yet, the frontend creates one and stores it in `localStorage`.

## Expected Response Shape

The frontend currently expects the backend to return data in this shape:

```json
{
  "history": {
    "messages": [
      {
        "content": "what will be 10 + 2929",
        "type": "human",
        "id": "e59a743a-8819-4810-928a-68a194c45520"
      },
      {
        "content": "10 + 2929 = 2939.",
        "type": "ai",
        "id": "lc_run--019f797f-2956-7210-b6c2-80e8f9c31d72-0",
        "response_metadata": {
          "created_at": "2026-07-19T08:30:07.27821939Z"
        }
      }
    ]
  }
}
```

## Response Normalization Rules

The frontend transforms backend messages before rendering:

- `type: "human"` becomes a user bubble
- `type: "ai"` becomes an assistant bubble
- only `human` and `ai` messages are shown
- non-chat system or tool messages are filtered out
- back-to-back assistant chunks are merged into one bubble
- `response_metadata.created_at` is used as the timestamp when available

## Markdown Rendering

Assistant messages support markdown rendering.

Supported content includes:

- headings
- bold and emphasis
- ordered and unordered lists
- tables
- code blocks
- inline code
- links
- blockquotes

This is useful for catalog summaries like:

- product count tables
- formatted comparisons
- structured search results
- recommendation lists

## Local Development Setup

### Prerequisites

- Node.js
- npm
- FastAPI backend running locally on port `8000`

### Install

```powershell
npm install
```

### Environment file

Create a `.env` file from `.env.example` if needed.

Example:

```env
VITE_API_BASE_URL=
VITE_CHAT_ENDPOINT=/api/chat
VITE_DEFAULT_THREAD_ID=
```

### Start the development server

```powershell
npm run dev
```

If PowerShell cannot find `npm`, use:

```powershell
$env:Path = 'C:\Program Files\nodejs;' + $env:Path
npm run dev
```

### Build for production

```powershell
npm run build
```

### Preview production build

```powershell
npm run preview
```

## Vite Proxy Configuration

The local dev server proxies frontend chat requests to FastAPI.

Current behavior:

- frontend request: `/api/chat`
- proxied backend request: `http://127.0.0.1:8000/chat`

This avoids common browser CORS issues during development.

## UI Behavior

### Chat layout

- message list is scrollable
- input composer stays fixed at the bottom of the chat panel
- chat panel uses the full width of the page
- messages auto-scroll to the newest response

### Message rendering

- user and assistant messages are visually separated
- assistant markdown tables are styled for readability
- timestamps are shown under each bubble
- loading state shows an animated typing indicator
- errors are displayed in the chat area

## Important Files

- `src/api/chatApi.js`
  Handles API requests, thread id creation, and `localStorage` persistence.

- `src/features/chat/chatSlice.js`
  Handles Redux state, async send flow, response normalization, and message merging.

- `src/components/MessageBubble.jsx`
  Renders user messages and markdown-formatted assistant messages.

- `src/styles.css`
  Contains layout styling, fixed input behavior, scroll behavior, and markdown table styles.

- `vite.config.js`
  Contains the Vite dev server and FastAPI proxy configuration.

## Customization Notes

You may want to customize these areas depending on the backend and product experience:

- change backend base URL or route
- adjust how history messages are mapped
- render structured product cards instead of plain markdown
- add filters, sorting, or pagination for catalog responses
- add authentication if the backend becomes protected
- persist full conversation history in a database or user session system

## Troubleshooting

### Clicking Send does not hit the backend

Check that:

- FastAPI is running on `http://127.0.0.1:8000`
- the frontend is calling `/api/chat`
- Vite is running and proxying requests correctly
- browser devtools Network tab shows the outgoing request

### Multiple bubbles appear for one response

The frontend already filters non-chat messages and merges sequential assistant chunks. If the backend returns a different history shape, update `src/features/chat/chatSlice.js`.

### Markdown looks broken

Make sure the backend is returning valid markdown text. Assistant markdown rendering is handled in `src/components/MessageBubble.jsx`.

### npm is not recognized in PowerShell

Run:

```powershell
$env:Path = 'C:\Program Files\nodejs;' + $env:Path
```

Then run:

```powershell
npm run dev
```

## Future Improvements

Possible next steps for this frontend:

- render product cards with image, price, and CTA button
- support structured JSON product results alongside markdown summaries
- add filters and quick actions in the chat UI
- support streaming responses
- add conversation reset button
- support multiple chat sessions
- add dark mode or theme customization

## License

Add your preferred project license here if needed.
