import { ChatOpenAI } from "@langchain/openai";
import { createClient } from "@supabase/supabase-js";
import { OpenAIEmbeddings } from "@langchain/openai";

/**
 * Verarbeitet den gesamten Chatverlauf:
 * 1. Extrahiert die letzte User-Nachricht
 * 2. Erstellt ein Embedding der Frage
 * 3. Ruft in Supabase die Funktion 'match_documents' auf, um relevante Kontexte zu erhalten
 * 4. Baut die System- und Chat-Nachrichten für das LLM
 * 5. Sendet alle Nachrichten an das ChatOpenAI-Modell und gibt die Antwort zurück
 *
 * @param {Array<{sender: string, message: string}>} chatMessages - Voller Chatverlauf
 * @returns {Promise<string>} - Antworttext des LLM
 */
export async function processMessageToOpenAI(chatMessages) {
    // Supabase-Umgebungsvariablen & OpenAI-API-Key
    const sbUrl = import.meta.env.VITE_SUPABASE_URL;
    const sbKey = import.meta.env.VITE_SUPABASE_API_KEY;
    const openAIApiKey = import.meta.env.VITE_OPENAI_API_KEY;

    // Supabase-Client für Vektor-Retrieval
    const supabase = createClient(sbUrl, sbKey);
    // Embedding-Client für Abfragen
    const embeddings = new OpenAIEmbeddings({ apiKey: openAIApiKey });

    // Letzte Userfrage extrahieren
    const lastUserMessage = chatMessages
        .filter(msg => msg.sender === "user")
        .slice(-1)[0]?.message;

    if (!lastUserMessage) return "Ich habe keine Frage erkannt.";

    // Embedding der User-Frage erzeugen
    const queryEmbedding = await embeddings.embedQuery(lastUserMessage);

    // RPC-Aufruf der Supabase-Funktion 'match_documents', um relevante Dokumente zur User-Frage zu finden
    const { data: documents, error } = await supabase.rpc("match_documents", {
        query_embedding: queryEmbedding,
        match_count: 3
    });

    if (error) {
        console.error("Fehler bei RPC: ", error.message);
        return "Es gab ein Problem beim Abrufen der Daten.";
    }

    // Kontext-Text aus den gefundenen Dokumenten zusammenstellen
    const contextText = documents.map(d => d.content).join("\n---\n");

    // Nachrichten-Array für LLM aufbauen
    const llm = new ChatOpenAI({ apiKey: openAIApiKey });
    const messagesForLLM = [
        {
            role: "system",
            content: "Du bist ein hilfreicher PC-Kaufberater. Nutze in erster Linie den bereitgestellten Kontext, um die Frage zu beantworten. Kontext: " + contextText
        },
        ...chatMessages.map(msg => ({
            role: msg.sender === "user" ? "user" : "assistant",
            content: msg.message
        }))
    ];

    // Anfrage ans Modell senden und Antworttext zurückgeben
    const response = await llm.invoke(messagesForLLM);
    return response.text;
}
