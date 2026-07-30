import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { StatusBadge } from './Home.jsx';
import { formatScheduledDateTime } from '../datetime.js';

export default function WebinarDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [w, setW] = useState(null);
  const [health, setHealth] = useState(null);
  const [error, setError] = useState('');
  const [emails, setEmails] = useState('');
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState(null);

  async function load() {
    try {
      const [webinar, appHealth] = await Promise.all([api.getWebinar(id), api.health()]);
      setW(webinar);
      setHealth(appHealth);
    } catch (e) {
      setError(e.message);
    }
  }
  useEffect(() => { load(); }, [id]);

  async function setStatus(status) {
    await api.setStatus(id, status);
    load();
  }

  async function invite(e) {
    e.preventDefault();
    setSending(true);
    setSendResult(null);
    try {
      const { results } = await api.sendInvites(id, emails);
      setSendResult(results);
      setEmails('');
      load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  }

  if (error) return <div className="container"><p className="error">{error}</p><Link to="/">← Back</Link></div>;
  if (!w) return <div className="container"><p>Loading…</p></div>;

  const origin = window.location.origin;

  return (
    <div className="container">
      <Link to="/" className="link">← All webinars</Link>
      <header className="topbar">
        <div>
          <h1>{w.title}</h1>
          <div className="meta">
            <StatusBadge status={w.status} />
            <span>{formatScheduledDateTime(w.scheduled_at)}</span>
          </div>
        </div>
        <div className="row-gap">
          {w.status !== 'live' && <button onClick={() => setStatus('live')}>Start session</button>}
          {w.status === 'live' && (
            <>
              <button onClick={() => navigate(`/webinars/${id}/room`)}>Enter room</button>
              <button className="danger" onClick={() => setStatus('ended')}>End session</button>
            </>
          )}
        </div>
      </header>

      {w.description && <p className="desc">{w.description}</p>}

      <section className="card">
        <h3>Invite students</h3>
        <p className="muted">Paste email addresses separated by commas, spaces, or new lines.</p>
        {health && !health.emailEnabled && (
          <p className="notice">
            Email delivery is disabled on this server. Invites will create join links only until
            {' '}<strong>RESEND_API_KEY</strong>{' '}is set. Current sender:{' '}
            <strong>{health.emailFrom}</strong>.
          </p>
        )}
        <form onSubmit={invite}>
          <textarea
            placeholder="alice@example.com, bob@example.com"
            value={emails}
            onChange={(e) => setEmails(e.target.value)}
            rows={4}
          />
          <button type="submit" disabled={sending}>{sending ? 'Sending…' : 'Send invites'}</button>
        </form>
        {sendResult && (
          <div className="send-result">
            <h4>Emailed {sendResult.filter((r) => r.emailed).length}/{sendResult.length}</h4>
            <ul>
              {sendResult.map((r) => (
                <li key={r.email}>
                  {r.emailed ? '✅' : '⚠️'} {r.email}
                  {!r.emailed && (
                    <> — <a href={r.joinUrl} target="_blank" rel="noreferrer">copy join link</a>
                    {r.error ? ` (${r.error})` : ' (email disabled)'}</>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="card">
        <h3>Invited ({w.invites.length})</h3>
        {w.invites.length === 0 && <p className="muted">No one invited yet.</p>}
        <ul className="invite-list">
          {w.invites.map((inv) => (
            <li key={inv.id}>
              <span>{inv.email}</span>
              <span className="meta">
                {inv.sent_at ? 'sent' : 'not sent'}
                <button
                  className="link"
                  onClick={() => {
                    navigator.clipboard.writeText(`${origin}/join/${inv.token}`);
                  }}
                >
                  copy link
                </button>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
