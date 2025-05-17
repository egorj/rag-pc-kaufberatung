
# PC-Kaufberater mit RAG-Pipeline

Ein interaktiver **PC-Kaufberater**, der mit Hilfe einer **Retrieval-Augmented Generation (RAG)**-Pipeline arbeitet. Nutzer stellen Fragen, und die App gibt fundierte, kontextbezogene Produktempfehlungen auf Basis einer eingebetteten Wissensdatenbank.

---

## Inhaltsverzeichnis
1. [Features](#features)  
2. [Technologien](#technologien)  
3. [Projektstruktur](#projektstruktur)  
4. [Architektur](#architektur)  
5. [Supabase-Funktion: match_documents](#supabase-funktion-match_documents)  

---

## Features

- 🔍 **Vektorbasierte Suche**: Relevante Inhalte werden durch semantisches Retrieval (OpenAI-Embeddings + pgvector) ermittelt  
- 💬 **Dynamische Antworten**: Kontextuelle Prompts für präzise Empfehlungen  
- 💡 **Echtzeit-Chatinterface**: Intuitive UX mit Reaktionsanzeige  
- 🧩 **Modular & erweiterbar**: Neue Produktdaten lassen sich einfach integrieren  

---

## Technologien

- **Frontend**: React + ChatScope UI Kit  
- **Backend-Logik**: LangChain JS + OpenAI APIs  
- **Datenbank**: Supabase (PostgreSQL + pgvector)  
- **Build-Tool**: Vite  

---

## Projektstruktur

```plaintext
public/
└── data/                     # Rohdaten: pc-produktbeschreibungen.txt
src/
├── data_preprocessing/       # Datenaufbereitung und Supabase-Import
│   └── database_init.js
├── service/                  # OpenAI-Anbindung & Retrieval
│   └── openai.js
├── App.jsx                   # Hauptkomponente mit Chat-Flow
├── main.jsx                  # Einstiegspunkt
├── App.css, index.css        # Stylesheets
└── vite.config.js            # Vite-Konfiguration
```

---

## Architektur

1. 🧹 **Datenaufbereitung**  
   `initializeVectorStore()` importiert Produkttexte, splittet sie in Chunks und schreibt die Embeddings in die Supabase-Tabelle `documents`.

2. 📥 **Retrieval (RAG)**  
   Bei einer Nutzerfrage wird ein Embedding erzeugt und via Supabase-Funktion `match_documents()` die relevantesten Chunks abgefragt.

3. ✍️ **Antwortgenerierung**  
   Der relevante Kontext + die Nutzereingabe werden an die OpenAI-Chat-API übergeben.

4. 🖥️ **Frontend-UI**  
   Die Antwort erscheint in einem modernen React-Chatfenster mit Typing-Indikator und Verlauf.

---

## Supabase-Funktion: `match_documents`

Die Funktion `match_documents()` wird in Supabase als RPC (Remote Procedure Call) definiert und findet die ähnlichsten Inhalte zu einer Anfrage basierend auf Vektor-Distanz:

```sql
create or replace function match_documents(
  query_embedding vector(1536),
  match_count int default 3
)
returns table (
  id bigint,
  content text,
  metadata jsonb,
  similarity float
)
language sql stable
as $$
  select
    id,
    content,
    metadata,
    1 - (embedding <=> query_embedding) as similarity
  from documents
  order by embedding <=> query_embedding
  limit match_count;
$$;
```

### Parameter:
- `query_embedding`: Vektor (hier mit OpenAI's Embeddings API erzeugt, deswegen 1536 Dimensionen)
- `match_count`: Anzahl zurückzugebender ähnlichster Dokumente

### Rückgabe:
- `id`: ID des Dokuments  
- `content`: Dokumentinhalt (z. B. ein Produktabschnitt)  
- `metadata`: Zusatzinfos (optional, z. B. Kategorie oder Zielgruppe)  
- `similarity`: Ähnlichkeitswert (1 = sehr ähnlich, 0 = unähnlich)

📌 **Hinweis**: Die Funktion nutzt `pgvector` und den `<=>` Operator zur Berechnung der Kosinus-Ähnlichkeit.
