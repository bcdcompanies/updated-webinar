import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, hostKey } from '../api.js';
import { formatScheduledDateTime } from '../datetime.js';

export default function Home() {
  const [key, setKey] = useState(hostKey.get());
  const [authed, setAuthed] = useState(!!hostKey.get());
  const [webinars, setWebinars] = useState([]);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ title: '', description: '', scheduledAt: '' });

  async function load() {
    try {
      setWebinars(await api.listWebinars());
      setError('');
    } catch (e) {
      setError(e.message);
      if (/host key/i.test(e.message)) setAuthed(false);
    }
  }

  useEffect(() => {
    if (authed) load();
  }, [authed]);

  function saveKey(e) {
    e.preventDefault();
    hostKey.set(key.trim());
    setAuthed(true);
  }

  function resetLocalAuth() {
    hostKey.clear();
    setKey('');
    setError('Cleared saved host key. Enter a key to continue.');
    setAuthed(false);
  }

  async function create(e) {
    e.preventDefault();
    try {
      await api.createWebinar({
        title: form.title,
        description: form.description,
        // Keep the datetime-local value as local wall time (no UTC conversion).
        scheduledAt: form.scheduledAt || null,
      });
      setForm({ title: '', description: '', scheduledAt: '' });
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  async function remove(id) {
    if (!confirm('Delete this webinar and its invites?')) return;
    await api.deleteWebinar(id);
    load();
  }

  if (!authed) {
    return (
      <div className="container narrow">
        <h1>Host sign-in</h1>
        <p className="muted">Enter the host key from your server's <code>.env</code>.</p>
        <form onSubmit={saveKey} className="card">
          <input
            type="password"
            placeholder="Host key"
            value={key}
            onChange={(e) => setKey(e.target.value)}
          />
          <button type="submit">Continue</button>
          <div style={{ marginTop: 10 }}>
            <button type="button" className="link" onClick={resetLocalAuth}>
              Reset local auth
            </button>
          </div>
        </form>
        {error && <p className="error">{error}</p>}
      </div>
    );
  }

  return (
    <div className="container">
      <header className="topbar">
        <h1>My webinars</h1>
        <button className="link" onClick={() => { hostKey.clear(); setAuthed(false); }}>
          Sign out
        </button>
      </header>

      <form onSubmit={create} className="card create-form">
        <h3>New webinar</h3>
        <input
          placeholder="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />
        <textarea
          placeholder="Description (optional)"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <label className="field-label">
          Scheduled time (optional)
          <input
            type="datetime-local"
            value={form.scheduledAt}
            onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })}
          />
        </label>
        <button type="submit">Create</button>
      </form>

      {error && <p className="error">{error}</p>}

      <ul className="webinar-list">
        {webinars.length === 0 && <p className="muted">No webinars yet. Create one above.</p>}
        {webinars.map((w) => (
          <li key={w.id} className="card webinar-item">
            <div>
              <Link to={`/webinars/${w.id}`} className="webinar-title">{w.title}</Link>
              <div className="meta">
                <StatusBadge status={w.status} />
                <span>{formatScheduledDateTime(w.scheduled_at)}</span>
                <span>{w.inviteCount} invited</span>
              </div>
            </div>
            <button className="danger link" onClick={() => remove(w.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function StatusBadge({ status }) {
  return <span className={`badge badge-${status}`}>{status}</span>;
}
