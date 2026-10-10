import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutGrid, Users, PlusSquare, LogOut, Menu, X, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import CameraTree from './CameraTree.jsx';

export default function AppShell() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="shell">
      <header className="topbar">
        <button className="icon-btn only-mobile" onClick={() => setSidebarOpen((o) => !o)} aria-label="Toggle camera tree">
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        
        <Link to="/" className="brand">
          <span className="brand-cam">CAM</span>
          <span className="brand-stream">STREAM</span>
        </Link>

        <nav className="topnav">
          <NavLink to="/" end>
            <LayoutGrid size={16} />
            <span>Video Wall</span>
          </NavLink>
          {user.role === 'admin' && (
            <>
              <NavLink to="/cameras">
                <PlusSquare size={16} />
                <span>Cameras</span>
              </NavLink>
              <NavLink to="/users">
                <Users size={16} />
                <span>Users</span>
              </NavLink>
            </>
          )}
          <Link to="/landing" className="nav-external" title="View Landing Page">
            <ExternalLink size={15} />
            <span>Overview</span>
          </Link>
        </nav>

        <div className="who">
          <div className="avatar">{user.username.slice(0, 1).toUpperCase()}</div>
          <div className="who-text">
            <span className="who-name">{user.username}</span>
            <span className={`badge badge-${user.role}`}>{user.role}</span>
          </div>
          <button className="icon-btn logout-btn" onClick={handleLogout} title="Log out" aria-label="Log out">
            <LogOut size={17} />
          </button>
        </div>
      </header>

      <div className="body">
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <CameraTree onPick={() => setSidebarOpen(false)} />
        </aside>
        {sidebarOpen && <div className="backdrop only-mobile" onClick={() => setSidebarOpen(false)} />}
        <main className="content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
