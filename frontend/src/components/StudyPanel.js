import React, { useState } from 'react';

export default function StudyPanel() {
  const [topic, setTopic]   = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode]     = useState('explain');

  const ask = async () => {
    if (!topic.trim()) return;
    setLoading(true);
    setResult('');

    const prompts = {
      explain: `Explain this concept simply with examples: ${topic}`,
      quiz:    `Generate 3 multiple choice questions about: ${topic}. Format each as Q: ... A) ... B) ... C) ... D) ... Answer: ...`,
      summary: `Give a short study summary (bullet points) of: ${topic}`
    };

    try {
      const res  = await fetch('http://localhost:3001/api/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ message: prompts[mode], history: [] })
      });
      const data = await res.json();
      setResult(data.reply || data.error);
    } catch {
      setResult('❌ Error connecting to server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="panel">
      <h2>📚 Study Tools</h2>

      <div className="mode-btns">
        {['explain','quiz','summary'].map(m => (
          <button
            key={m}
            className={`mode-btn ${mode === m ? 'active' : ''}`}
            onClick={() => setMode(m)}
          >
            {m === 'explain' ? '💡 Explain' : m === 'quiz' ? '📝 Quiz' : '📋 Summary'}
          </button>
        ))}
      </div>

      <div className="study-input">
        <input
          value={topic}
          onChange={e => setTopic(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && ask()}
          placeholder="Enter topic (e.g. Photosynthesis, Newton's Laws...)"
        />
        <button onClick={ask} disabled={loading}>
          {loading ? '⏳' : '→'}
        </button>
      </div>

      {result && (
        <div className="study-result">
          <pre>{result}</pre>
        </div>
      )}
    </div>
  );
}
