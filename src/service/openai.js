import { ChatOpenAI } from "@langchain/openai";
import { createClient } from "@supabase/supabase-js";
import { OpenAIEmbeddings } from "@langchain/openai";

export async function processMessageToOpenAI(chatMessages) {
    const sbUrl = import.meta.env.VITE_SUPABASE_URL;
    const sbKey = import.meta.env.VITE_SUPABASE_API_KEY;
    const openAIApiKey = import.meta.env.VITE_OPENAI_API_KEY;

    const supabase = createClient(sbUrl, sbKey);
    const embeddings = new OpenAIEmbeddings({ apiKey: openAIApiKey });

    // Letzte Userfrage extrahieren
    const lastUserMessage = chatMessages
        .filter(msg => msg.sender === "user")
        .slice(-1)[0]?.message;

    if (!lastUserMessage) return "Ich habe keine Frage erkannt.";

    // Frage einbetten
    const queryEmbedding = await embeddings.embedQuery(lastUserMessage);

    // RPC-Aufruf der Supabase-Funktion 'match_documents'
    const { data: documents, error } = await supabase.rpc("match_documents", {
        query_embedding: queryEmbedding,
        match_count: 3
    });

    if (error) {
        console.error("Fehler bei RPC: ", error.message);
        return "Es gab ein Problem beim Abrufen der Daten.";
    }

    const contextText = documents.map(d => d.content).join("\n---\n");

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

    const response = await llm.invoke(messagesForLLM);
    return response.text;
}
