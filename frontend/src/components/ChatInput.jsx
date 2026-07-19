import { useState } from "react";
import { useDispatch } from "react-redux";
import { sendMessage } from "../features/chat/chatSlice";

function ChatInput({ isLoading }) {
  const dispatch = useDispatch();
  const [message, setMessage] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    const trimmedMessage = message.trim();

    if (!trimmedMessage || isLoading) {
      return;
    }

    dispatch(sendMessage(trimmedMessage));
    setMessage("");
  };

  return (
    <form className="chat-input-wrap" onSubmit={handleSubmit}>
      <label className="sr-only" htmlFor="chat-message">
        Ask about products
      </label>
      <textarea
        id="chat-message"
        className="chat-input"
        placeholder="Ask about products, pricing, specs, availability, or comparisons..."
        rows="3"
        value={message}
        onChange={(event) => setMessage(event.target.value)}
      />
      <button className="send-button" type="submit" disabled={isLoading}>
        {isLoading ? "Sending..." : "Send"}
      </button>
    </form>
  );
}

export default ChatInput;
