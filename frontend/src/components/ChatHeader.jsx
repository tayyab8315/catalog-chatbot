function ChatHeader({ isLoading, totalMessages }) {
  return (
    <header className="chat-header">
      <div>
        <p className="eyebrow">Live Conversation</p>
        <h2>Catalog Assistant</h2>
      </div>
      <div className="chat-status">
        <span className={`status-dot ${isLoading ? "busy" : "online"}`} />
        <span>{isLoading ? "Thinking..." : "Ready"}</span>
        <span className="message-count">{totalMessages} messages</span>
      </div>
    </header>
  );
}

export default ChatHeader;
