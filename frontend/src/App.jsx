import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import ChatHeader from "./components/ChatHeader";
import ChatInput from "./components/ChatInput";
import ChatMessages from "./components/ChatMessages";
import { loadWelcomeMessage, selectChat } from "./features/chat/chatSlice";

function App() {
  const dispatch = useDispatch();
  const chat = useSelector(selectChat);

  useEffect(() => {
    dispatch(loadWelcomeMessage());
  }, [dispatch]);

  return (
    <main className="app-shell">
      <section className="chat-layout full-width">
        <section className="chat-panel">
          <ChatHeader
            isLoading={chat.isLoading}
            totalMessages={chat.messages.length}
          />
          <ChatMessages
            messages={chat.messages}
            isLoading={chat.isLoading}
            error={chat.error}
          />
          <ChatInput isLoading={chat.isLoading} />
        </section>
      </section>
    </main>
  );
}

export default App;
