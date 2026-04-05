import React, { useState, useEffect } from 'react';
import Chat from './components/Chat';
import TaskPanel from './components/TaskPanel';
import StudyPanel from './components/StudyPanel';
import './styles/App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [userName, setUserName] = useState('Student');

  useEffect(() => {
    fetch('http://localhost:3001/api/user/me')
      .then(r => r.json())
      .then(u => setUserName(u.name))
      .catch(() => {});
  }, []);

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <div className="avatar">🤖</div>
          <div>
            <h1>Sam</h1>
            <span className="subtitle">Hey {userName} 👋</span>
          </div>
        </div>
        <div className="status-dot" title="Online" />
      </header>

      <nav className="tabs">
        {['chat','tasks','study'].map(tab => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'chat'  ? '💬 Chat'  :
             tab === 'tasks' ? '✅ Tasks' : '📚 Study'}
          </button>
        ))}
      </nav>

      <main className="main">
        {activeTab === 'chat'  && <Chat />}
        {activeTab === 'tasks' && <TaskPanel />}
        {activeTab === 'study' && <StudyPanel />}
      </main>
    </div>
  );
}
