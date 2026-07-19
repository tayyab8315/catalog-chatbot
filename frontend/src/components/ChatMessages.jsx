import { useEffect, useRef } from "react";
import MessageBubble from "./MessageBubble";

function ChatMessages({ messages, isLoading, error }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <section className="messages-wrap">
      {messages.map((message) => (
        <MessageBubble key={message.id} message={message} />
      ))}

      {isLoading ? (
        <div className="message-row assistant">
          <div className="message-bubble typing">
            <span />
            <span />
            <span />
          </div>
        </div>
      ) : null}

      {error ? <p className="error-banner">{error}</p> : null}

      <div ref={bottomRef} />
    </section>
  );
}

export default ChatMessages;
