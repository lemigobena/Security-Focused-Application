import React, { useState } from 'react';
import { api } from '../services/api';
import { Shield, User, Lock, Trash2, Camera, Info, X } from 'lucide-react';
import { Modal } from './Modal';

export const Settings = ({ user, onUserUpdate }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [bio, setBio] = useState(user.bio || '');
  const [photoUrl, setPhotoUrl] = useState(user.profilePhotoUrl || '');
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [shareIP, setShareIP] = useState(user.shareIP ?? true);
  const [agreedToTerms, setAgreedToTerms] = useState(user.agreedToTerms ?? true);
  
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [confirmUsername, setConfirmUsername] = useState('');

  const clearMessage = () => setTimeout(() => setMessage({ type: '', text: '' }), 5000);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await api.updateProfile({ bio, profilePhotoUrl: photoUrl });
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      onUserUpdate({ ...user, bio, profilePhotoUrl: photoUrl });
      clearMessage();
    } catch (err) {
      setMessage({ type: 'error', text: err });
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return setMessage({ type: 'error', text: 'New passwords do not match' });
    }
    try {
      await api.updatePassword({ 
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      clearMessage();
    } catch (err) {
      setMessage({ type: 'error', text: err });
    }
  };

  const handleToggleSetting = async (field, value) => {
    try {
      await api.updateSettings({ [field]: value });
      if (field === 'agreedToTerms' && value === false) {
        window.location.href = '/login';
      }
      onUserUpdate({ ...user, [field]: value });
    } catch (err) {
      setMessage({ type: 'error', text: err });
    }
  };

  const handleDeleteAccount = async () => {
    if (confirmUsername !== user.username) {
      return alert("Username does not match.");
    }
    try {
      await api.deleteAccount();
      window.location.href = '/register';
    } catch (err) {
      setMessage({ type: 'error', text: err });
    }
  };

  const passwordRequirements = [
    { label: 'At least 8 characters', regex: /.{8,}/ },
    { label: 'At least one capital letter', regex: /[A-Z]/ },
    { label: 'At least one small letter', regex: /[a-z]/ },
    { label: 'At least one number', regex: /\d/ },
    { label: 'At least one special character', regex: /[@$!%*?&]/ },
  ];

  const isPasswordStrong = passwordRequirements.every(req => req.regex.test(passwordData.newPassword));

  return (
    <div className="settings-layout">
      <aside className="settings-sidebar">
        <button 
          className={activeTab === 'profile' ? 'active' : ''} 
          onClick={() => setActiveTab('profile')}
        >
          <User size={18} /> Edit Profile
        </button>
        <button 
          className={activeTab === 'password' ? 'active' : ''} 
          onClick={() => setActiveTab('password')}
        >
          <Lock size={18} /> Password
        </button>
        <button 
          className={activeTab === 'privacy' ? 'active' : ''} 
          onClick={() => setActiveTab('privacy')}
        >
          <Shield size={18} /> Privacy & Security
        </button>
        <button 
          className={`danger-text ${activeTab === 'delete' ? 'active' : ''}`} 
          onClick={() => setActiveTab('delete')}
        >
          <Trash2 size={18} /> Delete Account
        </button>
      </aside>

      <main className="settings-content">
        {message.text && (
          <div className={`${message.type}-banner`}>{message.text}</div>
        )}

        {activeTab === 'profile' && (
          <section className="settings-section">
            <h2>Public Profile</h2>
            <div className="form-group">
              <label>Profile Picture</label>
              <div className="profile-upload-section">
                <div className="profile-preview-large">
                  {photoUrl ? (
                    <img src={photoUrl} alt="Preview" />
                  ) : (
                    <div className="initial-placeholder">?</div>
                  )}
                </div>
                <div className="upload-controls">
                  <input 
                    type="file" 
                    id="profile-photo-input" 
                    hidden 
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      try {
                        const res = await api.uploadFile(file);
                        setPhotoUrl(res.file.path);
                        setMessage({ type: 'success', text: 'Photo uploaded! Click save to apply.' });
                      } catch (err) {
                        setMessage({ type: 'error', text: 'Upload failed: ' + err });
                      }
                    }}
                  />
                  <button 
                    type="button" 
                    className="btn-secondary"
                    onClick={() => document.getElementById('profile-photo-input').click()}
                  >
                    Change Photo
                  </button>
                  <p className="upload-hint">JPG, GIF or PNG. Max size 2MB.</p>
                </div>
              </div>
            </div>
            <form onSubmit={handleUpdateProfile}>
              <div className="form-group">
                <label>Bio</label>
                <textarea 
                  value={bio} 
                  onChange={e => setBio(e.target.value)}
                  placeholder="Tell us about yourself..."
                  maxLength={150}
                />
              </div>
              <button type="submit" className="btn-primary">Save Changes</button>
            </form>
          </section>
        )}

        {activeTab === 'password' && (
          <section className="settings-section">
            <h2>Change Password</h2>
            <form onSubmit={handleUpdatePassword}>
              <div className="form-group">
                <label>Current Password</label>
                <input 
                  type="password" 
                  value={passwordData.currentPassword}
                  onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>New Password</label>
                <input 
                  type="password" 
                  value={passwordData.newPassword}
                  onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
                  required
                />
                
                <div className="password-strength-checker">
                  <p className="strength-title">Password Requirements:</p>
                  <ul className="requirements-list">
                    {passwordRequirements.map((req, idx) => {
                      const isMet = req.regex.test(passwordData.newPassword);
                      return (
                        <li key={idx} className={`requirement-item ${isMet ? 'met' : 'unmet'}`}>
                          <div className={`status-dot ${isMet ? 'met' : 'unmet'}`}></div>
                          {req.label}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
              <div className="form-group">
                <label>Confirm New Password</label>
                <input 
                  type="password" 
                  value={passwordData.confirmPassword}
                  onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                  required
                />
              </div>
              <button 
                type="submit" 
                className="btn-primary" 
                disabled={!isPasswordStrong || passwordData.newPassword !== passwordData.confirmPassword}
              >
                Update Password
              </button>
            </form>
          </section>
        )}

        {activeTab === 'privacy' && (
          <section className="settings-section">
            <h2>Privacy & Security</h2>
            <div className="setting-toggle">
              <div className="toggle-info">
                <strong>Share IP Address</strong>
                <p>When enabled, your IP is recorded in audit logs. When disabled, it is redacted.</p>
              </div>
              <input 
                type="checkbox" 
                checked={shareIP} 
                onChange={e => {
                  setShareIP(e.target.checked);
                  handleToggleSetting('shareIP', e.target.checked);
                }}
              />
            </div>

            <div className="setting-toggle">
              <div className="toggle-info">
                <strong>Agree to Terms of Use</strong>
                <p>Disabling this will automatically log you out and restrict access.</p>
              </div>
              <input 
                type="checkbox" 
                checked={agreedToTerms} 
                onChange={e => {
                  setAgreedToTerms(e.target.checked);
                  handleToggleSetting('agreedToTerms', e.target.checked);
                }}
              />
            </div>
          </section>
        )}

        {activeTab === 'delete' && (
          <section className="settings-section">
            <h2 className="danger-text">Delete Account</h2>
            <div className="delete-info-box">
              <Info size={24} />
              <div>
                <p>Deleting your account is <strong>permanent</strong>. Your profile and personal data will be erased.</p>
                <p>To maintain community consistency, your posts will <strong>not</strong> be deleted but will be reassigned to a generic <em>"Deleted Account"</em> handle.</p>
              </div>
            </div>
            <p className="mt-4">If you still wish to proceed, please click the button below.</p>
            <button 
              className="btn-danger" 
              onClick={() => setIsDeleteModalOpen(true)}
            >
              Delete My Account
            </button>
          </section>
        )}
      </main>

      {isDeleteModalOpen && (
        <Modal onClose={() => setIsDeleteModalOpen(false)} title="Confirm Deletion">
          <div className="delete-confirm-modal">
            <p>Please enter your username <strong>{user.username}</strong> to confirm deletion.</p>
            <input 
              type="text" 
              placeholder="Enter username" 
              value={confirmUsername}
              onChange={e => setConfirmUsername(e.target.value)}
              className="confirm-input"
            />
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
              <button 
                className="btn-danger" 
                disabled={confirmUsername !== user.username}
                onClick={handleDeleteAccount}
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
