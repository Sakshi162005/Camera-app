import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Pencil, Trash2, Save, XCircle, Video, Maximize2 } from 'lucide-react';
import { api, errorMessage } from '../api/client.js';
import { useCameras } from '../context/CamerasContext.jsx';

const TYPES = [
  { value: '', label: 'Auto-detect from URL' },
  { value: 'rtsp', label: 'RTSP (IP camera)' },
  { value: 'http', label: 'HTTP / HLS / MJPEG URL' },
  { value: 'dshow', label: 'Windows webcam (DirectShow)' },
  { value: 'v4l2', label: 'Linux webcam (V4L2)' },
  { value: 'avfoundation', label: 'macOS webcam' },
  { value: 'test', label: 'Test pattern (no hardware)' },
];

const EMPTY = { name: '', source: '', group: '', type: '', viewerAccess: true };

function detectLabel(source) {
  const s = source.trim();
  if (!s) return 'test pattern';
  if (/^rtsps?:\/\//i.test(s)) return 'rtsp';
  if (/^https?:\/\//i.test(s)) return 'http';
  if (/^video=/i.test(s)) return 'dshow';
  if (/^\/dev\/video/i.test(s)) return 'v4l2';
  return 'http';
}

export default function ManageCamerasPage() {
  const { cameras, refresh } = useCameras();
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const payload = () => ({
    name: form.name,
    source: form.source,
    group: form.group,
    type: form.type || undefined,
    roles: form.viewerAccess ? ['admin', 'viewer'] : ['admin'],
  });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError(''); setNotice('');
    try {
      if (editingId) {
        await api.put(`/cameras/${editingId}`, payload());
        setNotice(`Updated "${form.name}"`);
      } else {
        await api.post('/cameras', payload());
        setNotice(`Added "${form.name}"`);
      }
      setForm(EMPTY);
      setEditingId(null);
      await refresh();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (cam) => {
    setEditingId(cam.id);
    setForm({
      name: cam.name,
      source: cam.source,
      group: cam.group || '',
      type: cam.type,
      viewerAccess: (cam.roles || []).includes('viewer'),
    });
    setError(''); setNotice('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEdit = () => { setEditingId(null); setForm(EMPTY); };

  const remove = async (cam) => {
    setBusy(true); setError(''); setNotice('');
    try {
      await api.delete(`/cameras/${cam.id}`);
      setNotice(`Deleted "${cam.name}"`);
      if (editingId === cam.id) cancelEdit();
      await refresh();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
      setConfirmId(null);
    }
  };

  return (
    <div className="manage">
      <div className="wall-bar">
        <div>
          <h1>Cameras</h1>
          <p className="muted small">Add a camera by name and stream URL. It appears in the tree for everyone allowed to see it.</p>
        </div>
      </div>

      <form className="card form-card" onSubmit={submit}>
        <div className="form-title">
          {editingId ? <><Pencil size={16} /> Edit camera</> : <><Plus size={16} /> Add camera</>}
        </div>
        <div className="form-grid">
          <label>
            Camera name
            <input value={form.name} onChange={set('name')} placeholder="Front gate" minLength={2} required />
          </label>
          <label>
            Group / location <span className="muted">(optional, use / for nesting)</span>
            <input value={form.group} onChange={set('group')} placeholder="Building A/Floor 1" />
          </label>
          <label className="span-2">
            Stream URL
            <input
              value={form.source}
              onChange={set('source')}
              placeholder="rtsp://user:pass@192.168.1.50:554/stream1"
              required={form.type !== 'test'}
            />
            <span className="hint">
              {form.type ? `Type: ${form.type}` : `Detected type: ${detectLabel(form.source)}`}
            </span>
          </label>
          <label>
            Stream type
            <select value={form.type} onChange={set('type')}>
              {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </label>
          <label className="check-row">
            <input type="checkbox" checked={form.viewerAccess} onChange={set('viewerAccess')} />
            <span>Viewers can watch this camera <span className="muted">(admins always can)</span></span>
          </label>
        </div>
        {error && <p className="error">{error}</p>}
        {notice && <p className="notice">{notice}</p>}
        <div className="form-actions">
          <button type="submit" className="btn" disabled={busy}>
            {editingId ? <><Save size={15} /> Save changes</> : <><Plus size={15} /> Add camera</>}
          </button>
          {editingId && <button type="button" className="btn ghost" onClick={cancelEdit}><XCircle size={15} /> Cancel</button>}
        </div>
      </form>

      <div className="card table-card">
        <table className="table">
          <thead>
            <tr><th>Name</th><th>Group</th><th>Type</th><th>Source</th><th>Access</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {cameras.length === 0 && (
              <tr><td colSpan={7} className="muted center">No cameras yet. Add your first one above.</td></tr>
            )}
            {cameras.map((cam) => (
              <tr key={cam.id} className={editingId === cam.id ? 'editing' : ''}>
                <td><span className="cell-name"><Video size={14} /> {cam.name}</span></td>
                <td className="muted">{cam.group ? cam.group.replaceAll('/', ' / ') : '-'}</td>
                <td><span className="chip">{cam.type}</span></td>
                <td className="mono truncate" title={cam.source}>{cam.source || '-'}</td>
                <td>{(cam.roles || []).includes('viewer') ? 'admin, viewer' : 'admin only'}</td>
                <td><span className={`dot ${cam.live ? 'on' : ''}`} />{cam.live ? `${cam.viewers} watching` : 'idle'}</td>
                <td className="actions">
                  <Link to={`/cameras/${cam.id}`} className="icon-btn" title="View"><Maximize2 size={15} /></Link>
                  <button className="icon-btn" onClick={() => startEdit(cam)} title="Edit"><Pencil size={15} /></button>
                  {confirmId === cam.id ? (
                    <>
                      <button className="btn danger small" onClick={() => remove(cam)} disabled={busy}>Confirm delete</button>
                      <button className="btn ghost small" onClick={() => setConfirmId(null)}>Keep</button>
                    </>
                  ) : (
                    <button className="icon-btn danger" onClick={() => setConfirmId(cam.id)} title="Delete"><Trash2 size={15} /></button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
