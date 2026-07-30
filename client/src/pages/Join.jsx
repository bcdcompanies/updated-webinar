import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../api.js';
import Conference from '../components/Conference.jsx';
import { formatScheduledDateTime } from '../datetime.js';

export default function Join() {
  const { token } = useParams();
  const [info, setInfo] = useState(null);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [conn, setConn] = useState(null);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setInfo(await api.getInvite(token));
      } catch (e) {
        setError(e.message);
      }
    })();
  }, [token]);

  async function join(e) {
    e.preventDefault();
    setJoining(true);
    setError('');
    try {
      setConn(await api.studentToken(token, name));
    } catch (e) {
      setError(e.message);
    } finally {
      setJoining(false);
    }
  }

  if (conn) {
    return (
      <Conference
        token={conn.token}
        serverUrl={conn.url}
        isHost={false}
        onLeave={() => setConn(null)}
      />
    );
  }

  if (error && !info) {
    return <div className="container narrow"><h1>Can't join</h1><p className="error">{error}</p></div>;
  }
  if (!info) return <div className="container narrow"><p>Loading…</p></div>;

  return (
    <div className="container narrow">
      <div className="card join-card">
        <h1>{info.title}</h1>
        {info.description && <p className="desc">{info.description}</p>}
        <p className="meta">
          {formatScheduledDateTime(info.scheduledAt, 'Starting soon')}
        </p>
        {info.status === 'ended' ? (
          <p className="error">This webinar has ended.</p>
        ) : (
          <>
            {info.status !== 'live' && (
              <p className="notice">The host hasn't started the session yet — you can still enter your name and wait.</p>
            )}
            <form onSubmit={join}>
              <input
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
              <button type="submit" disabled={joining}>{joining ? 'Joining…' : 'Join webinar'}</button>
            </form>
            {error && <p className="error">{error}</p>}
          </>
        )}
      </div>
    </div>
  );
}
