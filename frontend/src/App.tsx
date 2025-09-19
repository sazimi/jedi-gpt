import { useState } from 'react';
import axios from 'axios';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL;


function App() {
  const [prompt, setPrompt] = useState('');
  const [reply, setReply] = useState('');
  const [loading, setLoading] = useState(false);

  const askJedi = async () => {
    if (!prompt) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/jedi`, { prompt });
      setReply(res.data.reply);
    } catch (err) {
      setReply('⚠️ Something went wrong. Try again.');
    }
    setLoading(false);
  };

  return (
    <div className="container">
      <h1>Jedi GPT</h1>
      <textarea
        placeholder="Ask the Jedi Master..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={4}
      />
      <button onClick={askJedi} disabled={loading}>
        {loading ? 'Thinking...' : 'Ask'}
      </button>
      {reply && <div className="reply">{reply}</div>}
      <footer>Powered by Azure OpenAI & Container Apps</footer>
    </div>
  );
}

export default App;