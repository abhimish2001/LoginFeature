import React, { createContext, useContext, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { api } from './api';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';

// ─── Simple Auth Context ──────────────────────────────────────────────────────
const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => api.getCurrentUser());

  const login = async (email, password, captchaId, captchaCode) => {
    const result = await api.login(email, password, captchaId, captchaCode);
    if (result.success) {
      setUser(result.user);
    }
    return result;
  };

  const logout = () => {
    api.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: Boolean(user), login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ─── Protected Route Guard ────────────────────────────────────────────────────
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// ─── App Component ────────────────────────────────────────────────────────────
export default function App() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <main className="flex-grow-1">
        <Routes>
          <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
          <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer className="bg-white border-top py-3 text-center text-muted small mt-auto">
        <div className="container">
          <span>&copy; {new Date().getFullYear()} Authentication Portal &bull; ASP.NET Core &amp; React Bootstrap</span>
        </div>
      </footer>
    </div>
  );
}
