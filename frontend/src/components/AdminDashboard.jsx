import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ShieldAlert, Activity, UserX, UserCheck } from 'lucide-react';

export const AdminDashboard = ({ currentRole }) => {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (currentRole === 'ADMIN') {
      loadLogs();
    }
  }, [currentRole]);

  const loadLogs = async () => {
    try {
      const data = await api.getLogs();
      setLogs(data);
    } catch (err) {
      setError(err);
    }
  };

  if (currentRole !== 'ADMIN') {
    return (
      <div className="admin-container error-banner" style={{ textAlign: 'center', display: 'block', padding: '4rem' }}>
        <ShieldAlert size={48} style={{ margin: '0 auto 1rem auto', color: 'var(--danger)' }} />
        <h2>Access Denied</h2>
        <p>You must be an Administrator to view the security audit logs.</p>
      </div>
    );
  }

  const failedLogins = logs.filter(l => l.action === 'FAILED_LOGIN').length;
  const successfulLogins = logs.filter(l => l.action === 'LOGIN').length;

  return (
    <div className="admin-container">
      <div className="admin-header">
        <div className="admin-title-row">
          <ShieldAlert size={36} className="admin-icon" />
          <div>
            <h2>Security Audit Logs</h2>
            <p className="subtitle">System Audit Trail demonstrating GP-6 Chapter 9 Security Controls</p>
          </div>
        </div>
      </div>

      <div className="admin-stats">
        <div className="stat-card">
          <div className="stat-icon-wrapper"><Activity size={24} /></div>
          <div className="stat-info">
             <span className="stat-value">{logs.length}</span>
             <span className="stat-label">Total Events Logged</span>
          </div>
        </div>
        <div className="stat-card warning">
          <div className="stat-icon-wrapper"><UserX size={24} /></div>
          <div className="stat-info">
             <span className="stat-value">{failedLogins}</span>
             <span className="stat-label">Failed Logins</span>
          </div>
        </div>
        <div className="stat-card success">
          <div className="stat-icon-wrapper"><UserCheck size={24} /></div>
          <div className="stat-info">
             <span className="stat-value">{successfulLogins}</span>
             <span className="stat-label">Successful Logins</span>
          </div>
        </div>
      </div>
      
      {error && <div className="error-banner">{error}</div>}
      
      <div className="table-wrapper">
        <table className="audit-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Action</th>
              <th>User ID</th>
              <th>Entity</th>
              <th>Entity ID</th>
              <th>IP Address</th>
              <th>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => {
              const isFailure = log.action === 'FAILED_LOGIN';
              return (
                <tr 
                  key={log.id} 
                  className={isFailure ? 'row-warning' : ''}
                >
                  <td><span className="log-id">#{log.id}</span></td>
                  <td>
                    <span className={`badge-action ${log.action.toLowerCase()}`}>
                      {log.action}
                    </span>
                  </td>
                  <td>{log.userId || 'System'}</td>
                  <td>{log.entity}</td>
                  <td>{log.entityId || 'N/A'}</td>
                  <td className="mono">{log.ip || 'Unknown'}</td>
                  <td>{new Date(log.timestamp).toLocaleString()}</td>
                </tr>
              );
            })}
            {logs.length === 0 && (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '3rem' }}>No audit logs recorded yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
