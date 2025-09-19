import { useState, useCallback, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import './App.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface Message {
  id: string;
  type: 'user' | 'jedi';
  content: string;
  timestamp: Date;
}

interface ApiError {
  message: string;
  details?: any;
}

function App() {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [prompt]);

  const addMessage = useCallback((type: 'user' | 'jedi', content: string) => {
    const newMessage: Message = {
      id: `${Date.now()}-${Math.random()}`,
      type,
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newMessage]);
  }, []);

  const askJedi = useCallback(async () => {
    if (!prompt.trim()) return;
    
    const userPrompt = prompt.trim();
    setPrompt('');
    setError(null);
    setLoading(true);
    
    // Add user message immediately
    addMessage('user', userPrompt);
    
    try {
      const response = await axios.post(`${API_URL}/api/jedi`, 
        { prompt: userPrompt },
        { 
          timeout: 30000,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      
      if (response.data?.reply) {
        addMessage('jedi', response.data.reply);
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (err: any) {
      console.error('Error calling Jedi API:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Unknown error occurred';
      setError({
        message: 'Failed to connect with the Jedi Master',
        details: errorMessage
      });
    } finally {
      setLoading(false);
    }
  }, [prompt, addMessage]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      askJedi();
    }
  }, [askJedi]);

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const retryLastMessage = useCallback(() => {
    if (messages.length > 0) {
      const lastUserMessage = [...messages].reverse().find(m => m.type === 'user');
      if (lastUserMessage) {
        setPrompt(lastUserMessage.content);
        setError(null);
      }
    }
  }, [messages]);

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <Sparkles className="logo-icon" />
            <h1>Jedi GPT</h1>
          </div>
          <p className="subtitle">Seek wisdom from the Force</p>
          {messages.length > 0 && (
            <button 
              onClick={clearChat}
              className="clear-button"
              aria-label="Clear conversation"
            >
              Clear Chat
            </button>
          )}
        </div>
      </header>

      <main className="app-main">
        <div className="messages-container">
          {messages.length === 0 && (
            <div className="welcome-message">
              <Sparkles size={48} className="welcome-icon" />
              <h2>Welcome, young Padawan</h2>
              <p>Ask the Jedi Master for guidance and wisdom from the Force.</p>
              <div className="example-prompts">
                <button 
                  onClick={() => setPrompt("What is the meaning of the Force?")}
                  className="example-prompt"
                >
                  What is the meaning of the Force?
                </button>
                <button 
                  onClick={() => setPrompt("How do I become a Jedi?")}
                  className="example-prompt"
                >
                  How do I become a Jedi?
                </button>
                <button 
                  onClick={() => setPrompt("Tell me about the Jedi Code")}
                  className="example-prompt"
                >
                  Tell me about the Jedi Code
                </button>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`message ${message.type}`}
              role="article"
              aria-label={`${message.type === 'user' ? 'Your' : 'Jedi Master'} message`}
            >
              <div className="message-content">
                <div className="message-header">
                  <span className="message-sender">
                    {message.type === 'user' ? 'You' : 'Jedi Master'}
                  </span>
                  <time className="message-time">
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </time>
                </div>
                <div className="message-text">{message.content}</div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="message jedi loading" aria-live="polite">
              <div className="message-content">
                <div className="message-header">
                  <span className="message-sender">Jedi Master</span>
                </div>
                <div className="loading-indicator">
                  <span>The Force is awakening</span>
                  <div className="loading-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="error-message" role="alert">
              <AlertCircle size={20} />
              <div>
                <strong>{error.message}</strong>
                {error.details && <p>{error.details}</p>}
                <button onClick={retryLastMessage} className="retry-button">
                  <RefreshCw size={16} />
                  Retry
                </button>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="app-footer">
        <div className="input-container">
          <div className="input-wrapper">
            <textarea
              ref={textareaRef}
              placeholder="Ask the Jedi Master for wisdom..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
              className="message-input"
              rows={1}
              maxLength={1000}
              aria-label="Your message to the Jedi Master"
            />
            <button
              onClick={askJedi}
              disabled={loading || !prompt.trim()}
              className="send-button"
              aria-label="Send message"
            >
              <Send size={20} />
            </button>
          </div>
          <div className="input-footer">
            <span className="powered-by">
              Powered by Azure OpenAI & Container Apps
            </span>
            <span className="char-count">
              {prompt.length}/1000
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;