import { useEffect } from 'react';
import { initializeVectorStore } from './data preprocessing/langchain.js';

function App() {

  // Initialisiere die Supabase Vektor-Datenbank
  useEffect(() => {
    initializeVectorStore();
  }, []);

  return (
    <div className="App">
      <h1>PC Kaufberater</h1>
    </div>
  );
}

export default App;
