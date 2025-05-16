import { useState, useEffect } from 'react';
import { initializeVectorStore } from './data_preprocessing/database_init.js';
import { processMessageToOpenAI } from './service/openai.js';

import './App.css';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react';

function App() {

  // Initialisiere die Supabase Vektor-Datenbank
  /*useEffect(() => {
    initializeVectorStore();
  }, []);*/

  const [messages, setMessages] = useState([
    {
      message: "Hallo! Ich bin dein KI-Kaufberater für PCs. Wie kann ich dir helfen?",
      sender: "ChatGPT",
      direction: "incoming"
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  async function handleSend(userText) {
    // Füge die User-Message hinzu
    const userMessage = {
      message: userText,
      sender: "user",
      direction: "outgoing"
    };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    // Zeige Typing-Indikator
    setIsTyping(true);

    try {
      // Hole die AI-Antwort
      const aiText = await processMessageToOpenAI(updatedMessages);

      // Füge die AI-Message hinzu
      const aiMessage = {
        message: aiText,
        sender: "ChatGPT",
        direction: "incoming"
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error("Fehler beim Abruf von OpenAI:", err);
      setMessages(prev => [
        ...prev,
        { message: "Entschuldigung, da ist ein Fehler aufgetreten.", sender: "ChatGPT" }
      ]);
    } finally {
      // Typing-Indikator wieder aus
      setIsTyping(false);
    }
  }

  return (
    <div className="app">
      <h1>Dein KI-Kaufberater für PCs</h1>
      <p>Ich bin dein intelligenter Kaufberater und stehe dir mit individuellen Empfehlungen zur Seite.</p>
      <div className="chat-wrapper">
        <MainContainer>
          <ChatContainer>
            <MessageList
              scrollBehavior="smooth"
              typingIndicator={
                isTyping ? <TypingIndicator content="Dein Kaufberater tippt" /> : null
              }
            >
              {messages.map((msg, i) => (
                <Message key={i} model={msg} />
              ))}
            </MessageList>
            <MessageInput
              placeholder="Frag deinen KI-Berater etwas 🙂"
              onSend={handleSend}
            />
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  );
}

export default App;
