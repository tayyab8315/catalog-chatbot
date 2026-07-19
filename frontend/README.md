# Product Catalog Chatbot Frontend

This frontend is a React and Vite chat client for the product catalog assistant. It sends messages to the FastAPI backend, keeps a persistent browser-side `thread_id`, and renders assistant replies as Markdown.

## What The Frontend Does

- Sends user messages to the backend chat API
- Persists a `thread_id` in `localStorage`
- Renders conversation history returned by the backend
- Displays assistant responses with Markdown and GitHub-flavored tables
- Shows loading and error states in the chat UI
- Auto-scrolls to the latest message

## Tech Stack

- React 18
- Vite 5
- Redux Toolkit
- React Redux
- React Markdown
- `remark-gfm`

## Project Structure

```text
frontend/
|-- index.html
|-- package.json
|-- README.md
|-- vite.config.js
`-- src/
    |-- api/
    |   `-- chatApi.js
    |-- app/
    |   `-- store.js
    |-- components/
    |   |-- ChatHeader.jsx
    |   |-- ChatInput.jsx
    |   |-- ChatMessages.jsx
    |   |-- MessageBubble.jsx
    |   `-- ProductTips.jsx
    |-- features/
    |   `-- chat/
    |       `-- chatSlice.js
    |-- App.jsx
    |-- main.jsx
    `-- styles.css
```

## UI Behavior

- The chat header shows connection state and total rendered message count
- User messages appear on the right
- Assistant messages appear on the left
- Assistant content is rendered as Markdown
- A typing indicator is shown while a request is in flight
- Errors are shown inline in the message area
- The message list auto-scrolls as messages change

## How It Works

1. The user types a message into the textarea.
2. `sendMessage` in `src/features/chat/chatSlice.js` dispatches an async request.
3. `src/api/chatApi.js` sends a `POST` request to the backend.
4. The stored `thread_id` is included in every request.
5. The backend returns `history.messages`.
6. The frontend filters, normalizes, and renders only visible chat messages.

## API Integration

### Default development path

The frontend sends requests to:

```text
/api/chat
```

### Vite proxy target

During local development, Vite proxies those requests to:

```text
http://127.0.0.1:8000/chat
```

This is configured in `vite.config.js` by rewriting `/api/*` to the backend root.

## Request Payload

The frontend sends this JSON body:

```json
{
  "message": "add 22666 into previous total",
  "thread_id": "23821y382"
}
```

Notes:

- `message` comes from the textarea input
- `thread_id` is reused across turns so the backend can continue the same conversation
- if no thread id exists yet, the frontend creates one and stores it in `localStorage`

## Expected Backend Response

The frontend expects the backend to return a JSON object with `history.messages`.

Typical message fields used by the UI are:

- `type`
- `content`
- `id`
- `response_metadata.created_at`

## Response Normalization Rules

The frontend currently applies these rules before rendering:

- `human` messages become user bubbles
- `ai` messages become assistant bubbles
- only `human` and `ai` messages are displayed
- non-chat system or tool messages are filtered out
- sequential assistant messages are merged into one bubble
- timestamps prefer `response_metadata.created_at` when available

## Local Development

### Prerequisites

- Node.js
- npm
- backend running on `http://127.0.0.1:8000`

### Install

```powershell
npm install
```

### Start the dev server

```powershell
npm run dev
```

If PowerShell cannot find `npm`, make sure Node.js is installed and available in your `PATH`.

### Build for production

```powershell
npm run build
```

### Preview the production build

```powershell
npm run preview
```

## Frontend Environment Variables

The current code supports these optional Vite variables:

```env
VITE_API_BASE_URL=
VITE_CHAT_ENDPOINT=/api/chat
VITE_DEFAULT_THREAD_ID=
```

Notes:

- `VITE_API_BASE_URL` defaults to an empty string
- `VITE_CHAT_ENDPOINT` defaults to `/api/chat`
- `VITE_DEFAULT_THREAD_ID` is optional and can seed a fixed thread when needed
- there is currently no `.env.example` file in this folder

## Important Files

- `src/api/chatApi.js`
  Handles API requests, thread-id creation, and `localStorage` persistence.
- `src/features/chat/chatSlice.js`
  Handles Redux state, async send flow, and backend message normalization.
- `src/components/ChatMessages.jsx`
  Renders messages, typing state, errors, and auto-scroll behavior.
- `src/components/MessageBubble.jsx`
  Renders assistant Markdown and formatted timestamps.
- `src/styles.css`
  Defines the layout, responsive behavior, and markdown table styling.
- `vite.config.js`
  Configures the dev server and backend proxy.

## Current Limitations

- The UI depends on the backend returning a LangGraph-style `history.messages` array
- `ProductTips.jsx` exists but is not currently rendered by `App.jsx`
- There is no conversation reset UI yet
- There is no streaming response support yet
- There are no frontend tests yet

## Troubleshooting

### Clicking Send does not reach the backend

Check that:

- FastAPI is running on `http://127.0.0.1:8000`
- Vite is running locally
- the frontend is posting to `/api/chat`
- the Vite proxy is active

### Multiple assistant chunks appear oddly

The frontend already merges back-to-back assistant messages. If the backend response shape changes, update `src/features/chat/chatSlice.js`.

### Timestamps look wrong

The UI prefers `response_metadata.created_at` from backend messages. If that field is missing, it falls back to local values.
