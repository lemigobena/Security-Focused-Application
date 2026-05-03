import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import { AuthForms } from './components/AuthForms';
import { ResourceFeed } from './components/ResourceFeed';
import { AdminDashboard } from './components/AdminDashboard';
import { mockApi } from './services/mockApi';

function App() {
  const [currentRole, setCurrentRole] = useState('Guest');

  useEffect(() => {
    setCurrentRole(mockApi.getCurrentRole());
  }, []);

  const handleLogout = async () => {
    await mockApi.logout();
    setCurrentRole('Guest');
  };

  return (
    <Router>
      <div className="app-layout">
        <nav className="navbar">
          <div className="nav-brand">Community Resource Sharing</div>
          <div className="nav-links">
            <Link to="/">Feed</Link>
            
            {/* Conditional Rendering based on Role */}
            {currentRole === 'Guest' ? (
              <Link to="/auth">Login / Register</Link>
            ) : (
              <>
                {currentRole === 'Admin' && <Link to="/admin">Admin Dashboard</Link>}
                <button onClick={handleLogout} className="logout-btn">Logout</button>
              </>
            )}
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<ResourceFeed currentRole={currentRole} />} />
            <Route 
              path="/auth" 
              element={
                currentRole === 'Guest' 
                  ? <AuthForms onLoginSuccess={(role) => setCurrentRole(role)} /> 
                  : <Navigate to="/" />
              } 
            />
            <Route 
              path="/admin" 
              element={
                 currentRole === 'Admin'
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
