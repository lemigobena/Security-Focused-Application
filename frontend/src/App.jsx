import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { AuthForms } from './components/AuthForms';
import { ResourceFeed } from './components/ResourceFeed';
import { AdminDashboard } from './components/AdminDashboard';
import { CreatePost } from './components/CreatePost';
import { Profile } from './components/Profile';
import { Settings } from './components/Settings';
import { Bookmarks } from './components/Bookmarks';
import { TermsOfUse } from './components/TermsOfUse';
import { api } from './services/api';
import { ShieldCheck, User, Settings as SettingsIcon, Bookmark } from 'lucide-react';

const Hero = () => (
  <div className="hero-section">
    <div className="hero-content">
      <div className="badge">
        <img src="/images/aau-logo.png" alt="AAU Logo" className="hero-badge-logo" />
        AAU Community Resource Platform
      </div>
      <h1>Empowering the AAU Community Through Sharing</h1>
      <p>
        The official resource-sharing hub for Addis Ababa University students and faculty. 
        Collaborate, exchange academic materials, and grow together in a secure environment 
        built with modern security controls.
      </p>
      <div className="hero-stats">
        <div className="stat-item">
          <strong>Academic Excellence</strong>
          <span>Verified Resources</span>
        </div>
        <div className="stat-item">
          <strong>Secure Collaboration</strong>
          <span>Encrypted Exchange</span>
        </div>
        <div className="stat-item">
          <strong>Community Driven</strong>
          <span>Student Led</span>
        </div>
      </div>
    </div>
  </div>
);

const AppContent = ({ user, setUser, loading, handleLogout }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();

  if (loading) return <div className="loading-screen">Loading secure environment...</div>;

  const currentRole = user ? user.role : 'Guest';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    <div className="app-layout">
      <nav className="navbar">
        <Link to="/" className="nav-brand">
          <div className="brand-logo">
            <img src="/images/aau-logo.png" alt="AAU" />
          </div>
          <span>AAU CRS</span>
        </Link>
        
        <div className="nav-actions">
          {currentRole === 'Guest' ? (
            !isAuthPage && (
              <div className="auth-buttons">
                <Link to="/login" className="btn-ghost">Sign In</Link>
                <Link to="/register" className="btn-primary nav-btn">Get Started</Link>
              </div>
            )
          ) : (
            <div className="user-profile-section">
              {currentRole === 'ADMIN' && (
                <Link to="/admin" className="admin-link">Dashboard</Link>
              )}
              <div className="nav-divider"></div>
              
              <div 
                className="profile-dropdown-container"
                onMouseEnter={() => setDropdownOpen(true)}
                onMouseLeave={() => setDropdownOpen(false)}
              >
                <button className="user-badge-btn" onClick={() => setDropdownOpen(!dropdownOpen)}>
                  <div className="avatar">
                    {user.profilePhotoUrl ? (
                      <img src={user.profilePhotoUrl} alt="" className="avatar-img-sm" />
                    ) : (
                      user.username.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="username">{user.username}</span>
                </button>

                {dropdownOpen && (
                  <div className="dropdown-menu">
                    <Link to={`/profile/${user.username}`} onClick={() => setDropdownOpen(false)}>
                      <User size={16} /> Profile
                    </Link>
                    <Link to="/bookmarks" onClick={() => setDropdownOpen(false)}>
                      <Bookmark size={16} /> Activities
                    </Link>
                    <Link to="/settings" onClick={() => setDropdownOpen(false)}>
                      <SettingsIcon size={16} /> Settings
                    </Link>
                    <div className="dropdown-divider"></div>
                    <button onClick={handleLogout} className="dropdown-logout">
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      <main className="main-content">
        <Routes>
          <Route path="/" element={
            currentRole === 'Guest' ? <Hero /> : <ResourceFeed currentRole={currentRole} />
          } />
          <Route path="/profile/:username" element={<Profile currentUser={user} />} />
          <Route path="/settings" element={<Settings user={user} onUserUpdate={setUser} />} />
          <Route path="/bookmarks" element={<Bookmarks />} />
          <Route path="/terms" element={<TermsOfUse />} />
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
  );
};

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

  return (
    <Router>
      <AppContent 
        user={user} 
        setUser={setUser} 
        loading={loading} 
        handleLogout={handleLogout} 
      />
    </Router>
  );
}

export default App;
