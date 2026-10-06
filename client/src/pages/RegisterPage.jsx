import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Cctv, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { errorMessage } from '../api/client.js';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) return setError('Passwords do not match');
    setError('');
    setBusy(true);
    try {
      await register(username, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="auth-panel">
        <div className="auth-hero">
          <span className="brand-mark big"><Cctv size={26} /></span>
          <h1>Camera Stream</h1>
          <p>New accounts start as viewers. An admin can promote you later.</p>
        </div>
        <form className="auth-form" onSubmit={onSubmit}>
          <h2>Create account</h2>
          <label>
            Username
            <input value={username} onChange={(e) => setUsername(e.target.value)} minLength={3} autoFocus required />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
          </label>
          <label>
            Confirm password
            <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
          </label>
          {error && <p className="error">{error}</p>}
          <button type="submit" className="btn wide" disabled={busy}>
            <UserPlus size={16} /> {busy ? 'Creating...' : 'Register'}
          </button>
          <p className="muted small">Already registered? <Link to="/login">Sign in</Link></p>
        </form>
      </div>
    </div>
  );
}
