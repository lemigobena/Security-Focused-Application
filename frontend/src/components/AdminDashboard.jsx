import React, { useState, useEffect } from 'react';
import { mockApi } from '../services/mockApi';

export const AdminDashboard = ({ currentRole }) => {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (currentRole === 'Admin') {
      loadLogs();
    }
  }, [currentRole]);

  const loadLogs = async () => {
    try {
      const data = await mockApi.getLogs();
      setLogs(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (title) => {
    try {
      await mockApi.deletePost(title);
      setToast(`Success: Deleted post "${title}"`);
      loadLogs();
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  if (currentRole !== 'Admin') {
    return (
      <div className="admin-container error-banner">
        <h2>Access Denied</h2>
        <p>You must be an Administrator to view this page.</p>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <h2>Admin Dashboard - Audit Logs</h2>
      
      {error && <div className="error-banner">{error}</div>}
      
      {toast && (
        <div style={{ position: 'fixed', bottom: '20px', right: '20px', background: '#10b981', color: 'white', padding: '1rem 1.5rem', borderRadius: '8px', zIndex: 50, boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          {toast}
        </div>
      )}
      
      <div className="table-wrapper">
        <table className="audit-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Action</th>
              <th>Actor (User/IP)</th>
              <th>Entity</th>
              <th>Timestamp</th>
              <th>Actions (Admin Only)</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => {
              const isFailure = log.action === 'LOGIN_FAILURE';
              return (
                <tr 
                  key={log.id} 
                  style={isFailure ? { backgroundColor: '#fee2e2' } : {}}
                >
                  <td>{log.id}</td>
                  <td>
                    {log.action}
                    {isFailure && <strong style={{ color: '#dc2626', marginLeft: '8px' }}>[WARNING]</strong>}
                  </td>
                  <td>{log.userId || log.ip || 'System'}</td>
                  <td>{log.entity}</td>
                  <td>{new Date(log.timestamp).toLocaleString()}</td>
                  <td>
                    {log.entity.startsWith('Post::') && (
                      <button 
                        onClick={() => handleDelete(log.entity.replace('Post::', ''))}
                        style={{ background: 'transparent', border: '1px solid #e74c3c', color: '#e74c3c', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                      >
                        Delete Post
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {logs.length === 0 && (
              <tr><td colSpan="6">No logs available</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
