import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { createClient } from '@supabase/supabase-js'
import { SupabaseVectorStore } from 'langchain/vectorstores/supabase'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'

/**
 * Initialisiert die RAG-Pipeline:
 * 1. Lädt die Produktbeschreibungen
 * 2. Zerlegt den Text in Chunks
 * 3. Speichert die Embeddings in Supabase
 */
export async function initializeVectorStore() {
    try {
        // 1. Lade die Rohdaten aus der Textdatei
        const result = await fetch('../data/pc-produktbeschreibungen.txt');
        const text = await result.text();

        // 2. Lege den Text-Splitter an (Chunks mit Überlappung)
        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 500,
            chunkOverlap: 50,
        });

        // Erzeuge Dokumente (Chunks)
        const documents = await splitter.createDocuments([text]);

        // 3. Supabase-Client initialisieren
        const sbApiKey = import.meta.env.VITE_SUPABASE_API_KEY;
        const sbUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabase = createClient(sbUrl, sbApiKey);

        // 4. OpenAI-Embeddings erstellen und in Supabase speichern
        const openAIApiKey = import.meta.env.VITE_OPENAI_API_KEY;
        await SupabaseVectorStore.fromDocuments(
            documents,
            new OpenAIEmbeddings({ openAIApiKey }),
            {
                client: supabase,
                tableName: 'documents',
            }
        );
        console.log('Vektor-Datenbank erfolgreich initialisiert.');
    } catch (err) {
        console.error('Fehler beim Initialisieren der Vektor-Datenbank: ', err);
    }
}