import { useEffect, useState } from 'react';
import { UserPlus, KeyRound, Trash2 } from 'lucide-react';
import { api, errorMessage } from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';

const ROLES = ['admin', 'viewer'];

export default function UsersPage() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ username: '', password: '', role: 'viewer' });
  const [pwFor, setPwFor] = useState(null); // user id whose password is being reset
  const [pw, setPw] = useState('');
  const [confirmId, setConfirmId] = useState(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = () =>
    api.get('/users').then((r) => setUsers(r.data.users)).catch((e) => setError(errorMessage(e)));

  useEffect(() => { load(); }, []);

  const run = async (fn, okMsg) => {
    setError('');
    setNotice('');
    try {
      await fn();
      setNotice(okMsg);
      await load();
    } catch (e) {
      setError(errorMessage(e));
    }
  };

  const createUser = (e) => {
    e.preventDefault();
    const name = form.username;
    run(async () => {
      await api.post('/users', form);
      setForm({ username: '', password: '', role: 'viewer' });
    }, `User "${name}" created`);
  };

  const changeRole = (u, role) =>
    run(() => api.patch(`/users/${u.id}`, { role }), `${u.username} is now ${role}`);

  const savePassword = (u) =>
    run(async () => {
      await api.patch(`/users/${u.id}`, { password: pw });
      setPwFor(null);
      setPw('');
    }, `Password updated for ${u.username}`);

  const removeUser = (u) =>
    run(async () => {
      await api.delete(`/users/${u.id}`);
      setConfirmId(null);
    }, `Deleted ${u.username}`);

  return (
    <div className="manage">
      <div className="wall-bar">
        <div>
          <h1>Users</h1>
          <p className="muted small">Create accounts and control who is an admin.</p>
        </div>
      </div>

      <form className="card form-card" onSubmit={createUser}>
        <div className="form-title"><UserPlus size={16} /> Add user</div>
        <div className="form-grid three">
          <label>
            Username
            <input value={form.username} minLength={3} required onChange={(e) => setForm({ ...form, username: e.target.value })} />
          </label>
          <label>
            Password
            <input type="password" value={form.password} minLength={6} required onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </label>
          <label>
            Role
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </label>
        </div>
        {error && <p className="error">{error}</p>}
        {notice && <p className="notice">{notice}</p>}
        <div className="form-actions">
          <button type="submit" className="btn"><UserPlus size={15} /> Add user</button>
        </div>
      </form>

      <div className="card table-card">
        <table className="table">
          <thead>
            <tr><th>Username</th><th>Role</th><th>Created</th><th></th></tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>
                  <span className="cell-name">
                    <span className="avatar small">{u.username.slice(0, 1).toUpperCase()}</span>
                    {u.username}{u.id === me.id && <span className="muted"> (you)</span>}
                  </span>
                </td>
                <td>
                  <select value={u.role} disabled={u.id === me.id} onChange={(e) => changeRole(u, e.target.value)}>
                    {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
                <td className="muted">{new Date(u.createdAt).toLocaleString()}</td>
                <td className="actions">
                  {pwFor === u.id ? (
                    <>
                      <input
                        type="password"
                        placeholder="New password"
                        value={pw}
                        minLength={6}
                        autoFocus
                        onChange={(e) => setPw(e.target.value)}
                      />
                      <button className="btn small" onClick={() => savePassword(u)} disabled={pw.length < 6}>Save</button>
                      <button className="btn ghost small" onClick={() => { setPwFor(null); setPw(''); }}>Cancel</button>
                    </>
                  ) : confirmId === u.id ? (
                    <>
                      <button className="btn danger small" onClick={() => removeUser(u)}>Confirm delete</button>
                      <button className="btn ghost small" onClick={() => setConfirmId(null)}>Keep</button>
                    </>
                  ) : (
                    <>
                      <button className="icon-btn" title="Reset password" onClick={() => { setPwFor(u.id); setPw(''); }}><KeyRound size={15} /></button>
                      <button className="icon-btn danger" title="Delete" disabled={u.id === me.id} onClick={() => setConfirmId(u.id)}><Trash2 size={15} /></button>
                    </>
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
