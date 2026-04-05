import React, { useState, useEffect, useRef, useCallback } from 'react';
import useVoice from '../hooks/useVoice';

export default function Chat() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm Sam 🤖 Ask me anything — studies, tasks, or just chat!" }
  ]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim()) return;
    setInput('');
    setLoading(true);

    const userMsg = { role: 'user', content: text };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);

    try {
      const history = newMessages
        .slice(-10)
        .map(m => ({ role: m.role, content: m.content }));

      const res  = await fetch('http://localhost:3001/api/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ message: text, history })
      });
      const data = await res.json();
      const reply = data.reply || data.error || 'No response';

      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
      speak(reply);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '❌ Connection error. Is the server running?' }]);
    } finally {
      setLoading(false);
    }
  }, [messages]);

  const { listening, startListening, speak } = useVoice(sendMessage);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="chat">
      <div className="messages">
        {messages.map((m, i) => (
          <div key={i} className={`message ${m.role}`}>
            <span className="bubble">{m.content}</span>
          </div>
        ))}
        {loading && (
          <div className="message assistant">
            <span className="bubble typing">Sam is thinking<span className="dots">...</span></span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="input-row">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
          placeholder="Ask Sam anything..."
          disabled={loading}
        />
        <button
          className={`mic-btn ${listening ? 'active' : ''}`}
          onClick={listening ? () => {} : startListening}
          title="Voice input"
        >
          {listening ? '🔴' : '🎙️'}
        </button>
        <button
          className="send-btn"
          onClick={() => sendMessage(input)}
          disabled={loading || !input.trim()}
        >
          ➤
        </button>
      </div>
    </div>
  );
}
