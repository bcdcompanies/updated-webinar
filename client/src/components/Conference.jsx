import { useState } from 'react';
import {
  LiveKitRoom,
  VideoConference,
  useParticipants,
} from '@livekit/components-react';
import { api } from '../api.js';

export default function Conference({ token, serverUrl, isHost, webinarId, onLeave }) {
  return (
    <div className="room-wrap">
      <LiveKitRoom
        token={token}
        serverUrl={serverUrl}
        connect
        video={isHost}
        audio={isHost}
        onDisconnected={onLeave}
        data-lk-theme="default"
        style={{ height: '100dvh' }}
      >
        <VideoConference />
        {isHost && <ModerationPanel webinarId={webinarId} />}
      </LiveKitRoom>
    </div>
  );
}

// Host-only floating panel to promote/mute/remove students.
function ModerationPanel({ webinarId }) {
  const [open, setOpen] = useState(false);
  const participants = useParticipants();
  const students = participants.filter(
    (p) => !p.isLocal && String(p.identity).startsWith('student_')
  );

  async function togglePublish(p) {
    const canPublish = !p.permissions?.canPublish;
    try {
      await api.setPublish(webinarId, p.identity, canPublish);
    } catch (e) {
      alert(e.message);
    }
  }
  async function remove(p) {
    if (!confirm(`Remove ${p.name || p.identity} from the webinar?`)) return;
    try {
      await api.removeParticipant(webinarId, p.identity);
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <div className={`mod-panel ${open ? 'open' : ''}`}>
      <button className="mod-toggle" onClick={() => setOpen((o) => !o)}>
        {open ? '✕' : `Manage attendees (${students.length})`}
      </button>
      {open && (
        <div className="mod-body">
          <h4>Attendees</h4>
          {students.length === 0 && <p className="muted">No students have joined yet.</p>}
          <ul>
            {students.map((p) => {
              const canPublish = !!p.permissions?.canPublish;
              return (
                <li key={p.identity}>
                  <span className="mod-name">{p.name || p.identity}</span>
                  <span className="mod-actions">
                    <button onClick={() => togglePublish(p)}>
                      {canPublish ? 'Mute (view only)' : 'Let speak'}
                    </button>
                    <button className="danger" onClick={() => remove(p)}>Remove</button>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
