## PC‑Kaufberater mit RAG‑Pipeline

Dieses Projekt zeigt, wie man mit einer Retrieval‑Augmented‑Generation (RAG) Pipeline einen interaktiven PC‑Kaufberater baut.  
- **Knowledge Base**: Produkt‑Daten (Demo‑Beschreibungen von PCs für verschiedene Zielgruppen) werden in Supabase als Vektordatenbank gespeichert.  
- **Embedding & Retrieval**: Supabase Vector Store (PostgreSQL + pgvector) speichert und durchsucht OpenAI‑Embeddings.  
- **Backend**: LangChain JS orchestriert den Ablauf: Query → Vektor‑Retrieval → Prompt‑Konstruktion → OpenAI Chat Completion.  
- **Frontend**: React‑App mit einfachem Chat‑Interface und Produktempfehlungen in Echtzeit.  

### Features
- Schnelles Auffinden relevanter Produktinfos via Vektor‑Retrieval  
- Dynamische Prompt‑Generierung mit LangChain JS  
- Moderne Web‑UI in React für interaktives Nutzererlebnis  
- Leicht erweiterbare Struktur: Neue Produkttexte einfach in Supabase importieren  

### Tech Stack
- **Supabase** (PostgreSQL + pgvector)  
- **LangChain JS**  
- **OpenAI API** (Embeddings & Chat Completions)  
- **React** (User Frontend)  
