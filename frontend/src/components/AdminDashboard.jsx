import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { ShieldAlert, Activity, UserX, UserCheck, BarChart3, Users, FileText, AlertTriangle } from 'lucide-react';

export const AdminDashboard = ({ currentRole }) => {
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('stats');
  const [logCategory, setLogCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const statsData = await api.getStats();
      setStats(statsData);
      
      const logsData = await api.getLogs(logCategory);
      setLogs(logsData);

      const usersData = await api.getUsers();
      setUsers(usersData);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentRole === 'ADMIN') {
      fetchData();
    }
  }, [currentRole, logCategory]);

  if (currentRole !== 'ADMIN') {
    return (
      <div className="admin-container error-banner" style={{ textAlign: 'center', display: 'block', padding: '4rem' }}>
        <ShieldAlert size={48} style={{ margin: '0 auto 1rem auto', color: 'var(--danger)' }} />
        <h2>Access Denied</h2>
        <p>You must be an Administrator to view the security audit logs.</p>
      </div>
    );
  }

  const handleSuspendUser = async (id, currentStatus) => {
    try {
      await api.suspendUser(id, !currentStatus);
      fetchData();
    } catch (err) {
      alert("Failed to update user status");
    }
  };

  return (
    <div className="admin-container">
      <header className="admin-header">
        <div className="admin-title-row">
          <ShieldAlert size={36} className="admin-icon" />
          <div>
            <h2>Admin Control Panel</h2>
            <p className="subtitle">System Audit Trail & Security Management</p>
          </div>
        </div>

        <nav className="admin-tabs">
          <button className={activeTab === 'stats' ? 'active' : ''} onClick={() => setActiveTab('stats')}>
            <BarChart3 size={18} /> Overview
          </button>
          <button className={activeTab === 'logs' ? 'active' : ''} onClick={() => setActiveTab('logs')}>
            <FileText size={18} /> Audit Logs
          </button>
          <button className={activeTab === 'users' ? 'active' : ''} onClick={() => setActiveTab('users')}>
            <Users size={18} /> User Management
          </button>
        </nav>
      </header>

      {activeTab === 'stats' && stats && (
        <div className="admin-stats-view">
          <div className="admin-stats-grid">
            <div className="stat-card">
              <span className="stat-label">Total Users</span>
              <span className="stat-value">{stats.summary.userCount}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Active Resources</span>
              <span className="stat-value">{stats.summary.postCount}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Total Logs</span>
              <span className="stat-value">{stats.recentActions.length}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Bookmarks</span>
              <span className="stat-value">{stats.summary.bookmarkCount}</span>
            </div>
          </div>

          <div className="activity-graph-container">
            <h3>Recent System Activity</h3>
            <div className="activity-graph">
              {stats.actionStats.map((stat, i) => (
                <div key={i} className="graph-column">
                  <div 
                    className="graph-bar" 
                    style={{ height: `${Math.min(stat._count._all * 5, 200)}px` }}
                    title={`${stat._count._all} actions`}
                  ></div>
                  <span className="graph-label">{stat.action}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="admin-logs-view">
          <div className="log-filters">
            <button className={logCategory === '' ? 'active' : ''} onClick={() => setLogCategory('')}>All</button>
            <button className={logCategory === 'LOGIN' ? 'active' : ''} onClick={() => setLogCategory('LOGIN')}>Logins</button>
            <button className={logCategory === 'POST' ? 'active' : ''} onClick={() => setLogCategory('POST')}>Posts</button>
            <button className={logCategory === 'ADMIN' ? 'active' : ''} onClick={() => setLogCategory('ADMIN')}>Admin Actions</button>
          </div>

          <div className="table-wrapper">
            <table className="audit-table">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>User</th>
                  <th>IP Address</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log.id}>
                    <td>
                      <span className={`badge-action ${log.action.toLowerCase()}`}>{log.action}</span>
                    </td>
                    <td>{log.userId || 'System'}</td>
                    <td className="mono">{log.ip || 'REDACTED'}</td>
                    <td>{new Date(log.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="admin-users-view">
          <div className="table-wrapper">
            <table className="audit-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>{u.username}</td>
                    <td>{u.email}</td>
                    <td>{u.role}</td>
                    <td>
                      <span className={`badge-action ${u.isSuspended ? 'failed_login' : 'login'}`}>
                        {u.isSuspended ? 'SUSPENDED' : 'ACTIVE'}
                      </span>
                    </td>
                    <td>
                      {u.role !== 'ADMIN' && (
                        <button 
                          onClick={() => handleSuspendUser(u.id, u.isSuspended)}
                          className={`btn-suspend ${u.isSuspended ? 'btn-unsuspend' : ''}`}
                          style={{ backgroundColor: u.isSuspended ? '#d1fae5' : '#fee2e2', color: u.isSuspended ? '#065f46' : '#991b1b' }}
                        >
                          {u.isSuspended ? 'Unsuspend' : 'Suspend'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="alert-box">
            <AlertTriangle size={18} />
            <span>Note: Security policy prevents deletion of users. Only suspension is allowed.</span>
          </div>
        </div>
      )}
    </div>
  );
};
