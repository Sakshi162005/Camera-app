import { Routes, Route, Navigate } from 'react-router-dom';
import AppShell from './components/AppShell.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import { CamerasProvider } from './context/CamerasContext.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import LandingPage from './pages/LandingPage.jsx';
import WallPage from './pages/WallPage.jsx';
import CameraPage from './pages/CameraPage.jsx';
import ManageCamerasPage from './pages/ManageCamerasPage.jsx';
import UsersPage from './pages/UsersPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/landing" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Authentication guard */}
      <Route element={<ProtectedRoute />}>
        <Route
          element={
            <CamerasProvider>
              <AppShell />
            </CamerasProvider>
          }
        >
          <Route path="/" element={<WallPage />} />
          <Route path="/cameras/:id" element={<CameraPage />} />
          {/* Authorization guard: admin only */}
          <Route element={<ProtectedRoute roles={['admin']} />}>
            <Route path="/cameras" element={<ManageCamerasPage />} />
            <Route path="/users" element={<UsersPage />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
