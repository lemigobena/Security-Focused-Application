import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthForms } from './components/AuthForms';
import { ResourceFeed } from './components/ResourceFeed';
import { AdminDashboard } from './components/AdminDashboard';
import { CreatePost } from './components/CreatePost';
import { api } from './services/api';
import { ShieldCheck } from 'lucide-react';

const Hero = () => (
  <div className="hero-section">
    <div className="hero-content">
      <div className="badge"><ShieldCheck size={16} /> GP-6 Security-Focused Project</div>
      <h1>AAU Community Resource Platform</h1>
      <p>
        Built by the AAU Student Entrepreneurship Team. A minimal, secure prototype 
        demonstrating security controls from Chapters 5 (Authentication), 
        6 (Access Control), and 9 (Auditing).
      </p>
    </div>
  </div>
);

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const data = await api.getMe();
        if (data.user) {
          setUser(data.user);
        }
      } catch (err) {
        console.log("Not authenticated", err);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await api.logout();
      setUser(null);
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  if (loading) return <div className="loading-screen">Loading secure environment...</div>;

  const currentRole = user ? user.role : 'Guest';

  return (
    <Router>
      <div className="app-layout">
        <nav className="navbar">
          <Link to="/" className="nav-brand">
            <div className="brand-logo">
              <ShieldCheck className="brand-icon" size={26} />
            </div>
            <span>AAU Resources</span>
          </Link>
          
          <div className="nav-actions">
            {currentRole === 'Guest' ? (
              <div className="auth-buttons">
                <Link to="/login" className="btn-ghost">Sign In</Link>
                <Link to="/register" className="btn-primary nav-btn">Get Started</Link>
              </div>
            ) : (
              <div className="user-profile-section">
                {currentRole === 'ADMIN' && (
                  <Link to="/admin" className="admin-link">Dashboard</Link>
                )}
                <div className="nav-divider"></div>
                <div className="user-badge">
                  <div className="avatar">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <span className="username">{user.username}</span>
                </div>
                <button onClick={handleLogout} className="btn-logout-icon" title="Logout">
                  Logout
                </button>
              </div>
            )}
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={
              <>
                {currentRole === 'Guest' ? (
                  <Hero />
                ) : (
                  <ResourceFeed currentRole={currentRole} />
                )}
              </>
            } />
            <Route 
              path="/create-post" 
              element={
                (currentRole === 'USER') 
                  ? <CreatePost /> 
                  : <Navigate to="/login" />
              } 
            />
            <Route 
              path="/login" 
              element={
                currentRole === 'Guest' 
                  ? <AuthForms onLoginSuccess={(u) => setUser(u)} initialMode="login" /> 
                  : <Navigate to="/" />
              } 
            />
            <Route 
              path="/register" 
              element={
                currentRole === 'Guest' 
                  ? <AuthForms onLoginSuccess={(u) => setUser(u)} initialMode="register" /> 
                  : <Navigate to="/" />
              } 
            />
            <Route 
              path="/admin" 
              element={
                 currentRole === 'ADMIN'
                   ? <AdminDashboard currentRole={currentRole} />
                   : <Navigate to="/" />
              } 
            />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
