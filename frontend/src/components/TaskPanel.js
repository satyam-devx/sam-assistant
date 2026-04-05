import React, { useState, useEffect } from 'react';

export default function TaskPanel() {
  const [tasks, setTasks]   = useState([]);
  const [title, setTitle]   = useState('');
  const [priority, setPriority] = useState('medium');

  const load = () =>
    fetch('http://localhost:3001/api/tasks')
      .then(r => r.json()).then(setTasks).catch(() => {});

  useEffect(() => { load(); }, []);

  const add = async () => {
    if (!title.trim()) return;
    await fetch('http://localhost:3001/api/tasks', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ title, priority })
    });
    setTitle('');
    load();
  };

  const toggle = async (id, completed) => {
    await fetch(`http://localhost:3001/api/tasks/${id}`, {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ completed: !completed })
    });
    load();
  };

  const remove = async (id) => {
    await fetch(`http://localhost:3001/api/tasks/${id}`, { method: 'DELETE' });
    load();
  };

  const priorityColor = p =>
    p === 'high' ? '#ff4757' : p === 'medium' ? '#ffa502' : '#2ed573';

  return (
    <div className="panel">
      <h2>📝 My Tasks</h2>

      <div className="add-task">
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          placeholder="Add a new task..."
        />
        <select value={priority} onChange={e => setPriority(e.target.value)}>
          <option value="low">🟢 Low</option>
          <option value="medium">🟡 Medium</option>
          <option value="high">🔴 High</option>
        </select>
        <button onClick={add}>Add</button>
      </div>

      <div className="task-list">
        {tasks.length === 0 && <p className="empty">No tasks yet! Add one above ☝️</p>}
        {tasks.map(t => (
          <div key={t.id} className={`task-item ${t.completed ? 'done' : ''}`}>
            <span
              className="priority-dot"
              style={{ background: priorityColor(t.priority) }}
            />
            <span className="task-title" onClick={() => toggle(t.id, t.completed)}>
              {t.completed ? '✅' : '⬜'} {t.title}
            </span>
            <button className="del-btn" onClick={() => remove(t.id)}>🗑️</button>
          </div>
        ))}
      </div>
    </div>
  );
}
