import { useState, useEffect } from 'react';
import { initializeVectorStore } from './data_preprocessing/database_init.js';
import { processMessageToOpenAI } from './service/openai.js';

import './App.css';
import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { MainContainer, ChatContainer, MessageList, Message, MessageInput, TypingIndicator } from '@chatscope/chat-ui-kit-react';

/**
 * Stellt das Chat-Interface für den KI-Kaufberater dar
 * - Lädt initial die Vektor-Datenbank (optional)
 * - Verwaltet Chat-Nachrichten und Typing-Status
 * - Sendet User-Eingaben inkl. dem vorherigen Chatverlauf an die processMessageToOpenAI-Funktion und zeigt Antworten an
 */
function App() {
  // Optional: Vektor-Datenbank beim ersten Mount initialisieren
  /*useEffect(() => {
    initializeVectorStore();
  }, []);*/

  // Nachrichten-State: Enthält alle Chat-Nachrichten mit Text, Sender und Richtung
  const [messages, setMessages] = useState([
    {
      message: "Hallo! Ich bin dein KI-Kaufberater für PCs. Wie kann ich dir helfen?",
      sender: "ChatGPT",
      direction: "incoming"
    }
  ]);
  // Typing-Indikator-State: Zeigt an, ob das Modell gerade tippt
  const [isTyping, setIsTyping] = useState(false);

  /**
   * Handler, der aufgerufen wird, wenn der User eine Nachricht sendet.
   * Fügt die User-Nachricht zum Verlauf hinzu, zeigt den Typing-Indikator,
   * ruft die OpenAI-Verarbeitung auf und fügt dann die AI-Antwort hinzu.
   * @param {string} userText - Der eingegebene Text des Nutzers
   */
  async function handleSend(userText) {
    // Füge die User-Message zum Verlauf hinzu
    const userMessage = {
      message: userText,
      sender: "user",
      direction: "outgoing"
    };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);

    // Typing-Indikator aktivieren
    setIsTyping(true);

    try {
      // Verarbeite die Nachricht und hole AI-Antwort
      const aiText = await processMessageToOpenAI(updatedMessages);

      // Füge die AI-Antwort zum Verlauf hinzu
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
      // Typing-Indikator deaktivieren
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
