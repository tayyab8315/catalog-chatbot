import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

function formatTimestamp(timestamp) {
  try {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return "";
  }
}

function MessageBubble({ message }) {
  const isAssistant = message.role === "assistant";

  return (
    <div className={`message-row ${message.role}`}>
      <article className={`message-bubble ${message.role}`}>
        {isAssistant ? (
          <div className="message-markdown">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
        ) : (
          <p>{message.content}</p>
        )}
        <time>{formatTimestamp(message.timestamp)}</time>
      </article>
    </div>
  );
}

export default MessageBubble;
