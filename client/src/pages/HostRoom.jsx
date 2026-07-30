import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import Conference from '../components/Conference.jsx';

export default function HostRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [conn, setConn] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await api.hostToken(id, 'Host');
        if (active) setConn(data);
      } catch (e) {
        if (active) setError(e.message);
      }
    })();
    return () => { active = false; };
  }, [id]);

  if (error) {
    return (
      <div className="container narrow">
        <p className="error">{error}</p>
        <button onClick={() => navigate(`/webinars/${id}`)}>← Back</button>
      </div>
    );
  }
  if (!conn) return <div className="container"><p>Connecting…</p></div>;

  return (
    <Conference
      token={conn.token}
      serverUrl={conn.url}
      isHost
      webinarId={id}
      onLeave={() => navigate(`/webinars/${id}`)}
    />
  );
}
