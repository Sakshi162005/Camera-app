import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LogIn, ShieldCheck, ArrowLeft, Lock, User } from 'lucide-react';
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
      <div className="auth-glow" />
      
      <div className="auth-panel">
        <div className="auth-hero">
          <Link to="/landing" className="hero-brand auth-logo">
            <span className="brand-cam">CAM</span>
            <span className="brand-stream">STREAM</span>
          </Link>
          <h2>Real-Time Surveillance Control</h2>
          <p>Secure, sub-second latency video wall access for all network and IP surveillance feeds.</p>
          
          <div className="auth-features">
            <div className="auth-feature-item">
              <ShieldCheck size={16} className="feature-icon-red" />
              <span>Multi-feed 4K live video wall</span>
            </div>
            <div className="auth-feature-item">
              <ShieldCheck size={16} className="feature-icon-red" />
              <span>Role-based access &amp; RTSP encryption</span>
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
            <h3>Operator Login</h3>
            <span className="form-sub">Enter credentials to open your video wall</span>
          </div>

          <label>
            <span>Username</span>
            <div className="input-with-icon">
              <User size={16} className="input-icon" />
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter operator username"
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
                placeholder="••••••••"
                required
              />
            </div>
          </label>

          {error && <p className="error">{error}</p>}

          <button type="submit" className="btn wide" disabled={busy}>
            <LogIn size={16} /> {busy ? 'Authenticating...' : 'Sign in to Console'}
          </button>

          <p className="muted small text-center">
            No account? <Link to="/register" className="highlight-link">Create one</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
