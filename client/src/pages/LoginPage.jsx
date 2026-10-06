import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Cctv, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { errorMessage } from '../api/client.js';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(username, password);
      navigate(location.state?.from?.pathname || '/', { replace: true });
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
          <p>Secure live view for every camera on your network. Sign in to open your video wall.</p>
        </div>
        <form className="auth-form" onSubmit={onSubmit}>
          <h2>Sign in</h2>
          <label>
            Username
            <input value={username} onChange={(e) => setUsername(e.target.value)} autoFocus required />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </label>
          {error && <p className="error">{error}</p>}
          <button type="submit" className="btn wide" disabled={busy}>
            <LogIn size={16} /> {busy ? 'Signing in...' : 'Sign in'}
          </button>
          <p className="muted small">No account? <Link to="/register">Create one</Link></p>
        </form>
      </div>
    </div>
  );
}
