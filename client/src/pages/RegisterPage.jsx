import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, ShieldCheck, ArrowLeft, Lock, User, KeyRound } from 'lucide-react';
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
      <div className="auth-glow" />

      <div className="auth-panel">
        <div className="auth-hero">
          <Link to="/landing" className="hero-brand auth-logo">
            <span className="brand-cam">CAM</span>
            <span className="brand-stream">STREAM</span>
          </Link>
          <h2>Create Operator Account</h2>
          <p>New accounts are initialized with Viewer permissions. Administrators can assign elevated stream controls.</p>

          <div className="auth-features">
            <div className="auth-feature-item">
              <ShieldCheck size={16} className="feature-icon-red" />
              <span>Direct access to permitted camera streams</span>
            </div>
            <div className="auth-feature-item">
              <ShieldCheck size={16} className="feature-icon-red" />
              <span>Custom multi-tile video wall layouts</span>
            </div>
          </div>

          <div className="auth-back-link">
            <Link to="/landing">
              <ArrowLeft size={14} /> Back to Overview
            </Link>
          </div>
        </div>

        <form className="auth-form" onSubmit={onSubmit}>
          <div className="form-header">
            <h3>Register Account</h3>
            <span className="form-sub">Fill in your operator details</span>
          </div>

          <label>
            <span>Username</span>
            <div className="input-with-icon">
              <User size={16} className="input-icon" />
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose username"
                minLength={3}
                autoFocus
                required
              />
            </div>
          </label>

          <label>
            <span>Password</span>
            <div className="input-with-icon">
              <Lock size={16} className="input-icon" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                minLength={6}
                required
              />
            </div>
          </label>

          <label>
            <span>Confirm password</span>
            <div className="input-with-icon">
              <KeyRound size={16} className="input-icon" />
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Re-enter password"
                required
              />
            </div>
          </label>

          {error && <p className="error">{error}</p>}

          <button type="submit" className="btn wide" disabled={busy}>
            <UserPlus size={16} /> {busy ? 'Creating...' : 'Register Operator'}
          </button>

          <p className="muted small text-center">
            Already registered? <Link to="/login" className="highlight-link">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
