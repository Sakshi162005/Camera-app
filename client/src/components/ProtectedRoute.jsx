import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Authentication guard; pass `roles` to add an authorization check.
export default function ProtectedRoute({ roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <p className="center">Loading…</p>;
  if (!user) return <Navigate to={location.pathname === '/' ? '/landing' : '/login'} state={{ from: location }} replace />;
  if (roles && !roles.includes(user.role)) {
    return (
      <div className="card">
        <h2>Access denied</h2>
        <p>Your role ({user.role}) is not allowed to view this page.</p>
      </div>
    );
  }
  return <Outlet />;
}
