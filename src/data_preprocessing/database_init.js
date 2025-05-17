import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { OpenAIEmbeddings } from "@langchain/openai";
import { createClient } from "@supabase/supabase-js";

/*
 * Initialisiert die Vektor-Datenbank mit folgenden Schritten:
 * 1. Lädt Produktbeschreibungs-Text aus 'public/data/pc-produktbeschreibungen.txt'.
 * 2. Zerlegt den Text in überlappende Chunks (Größe: 500, Overlap: 50).
 * 3. Löscht bestehende Einträge in der Supabase-Tabelle 'documents'.
 * 4. Erzeugt Embeddings via OpenAI und speichert sie in Supabase.
 */
export async function initializeVectorStore() {
    try {
        // Lade die Rohdaten aus der Textdatei
        const result = await fetch('/data/pc-produktbeschreibungen.txt');
        const text = await result.text();

        // Lege den Text-Splitter an (Chunks mit Überlappung)
        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 500,
            chunkOverlap: 50,
        });

        // Erzeuge Dokumente (Text in Chunks aufteilen für besseres Retrieval)
        const documents = await splitter.createDocuments([text]);

        // Supabase-Client initialisieren
        const sbApiKey = import.meta.env.VITE_SUPABASE_API_KEY;
        const sbUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabase = createClient(sbUrl, sbApiKey);

        // Lösche alle Einträge in Tabelle 'documents' bevor neue Einträge eingefügt werden
        const { error } = await supabase
            .from("documents")
            .delete()
            .not("id", "is", null); // löscht alle Zeilen, da jede id ungleich null ist
        if (error) {
            console.error("Beim Löschen der Daten in Tabelle 'documents' ist ein Fehler aufgetreten: ", error);
            throw error;
        } else {
            console.log("Tabelle 'documents' wurde erfolgreich geleert!");
        }

        // OpenAI-Embeddings erstellen und in Supabase speichern
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