import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export const CreatePost = () => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleCreatePost = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    try {
      let fileId = null;

      // 1. Upload file if selected
      if (file) {
        const uploadRes = await api.uploadFile(file);
        fileId = uploadRes.file.id;
      }

      // 2. Create post with title, body, and fileId
      await api.createPost(title, body, fileId);
      
      navigate('/');
    } catch (err) {
      setError(err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-post-container">
      <div className="create-post-header">
        <h2>Post New Resource</h2>
        <p>Share study materials, notes, or tips with the AAU community. (Fill at least 2 fields)</p>
      </div>

      <form onSubmit={handleCreatePost} className="create-post-form page-form">
        {error && <div className="error-banner">{error}</div>}
        
        <div className="form-group">
          <label>Resource Title</label>
          <input 
            type="text" 
            placeholder="e.g. Introduction to STRIDE Threat Modeling"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
          />
        </div>

        <div className="form-group">
          <label>Description / Content</label>
          <textarea 
            placeholder="Describe your resource..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={2000}
            rows={8}
          />
        </div>

        <div className="form-group">
          <label>Attach File (Videos, PDF, Images, etc.)</label>
          <input 
            type="file" 
            onChange={(e) => setFile(e.target.files[0])}
            className="file-input"
          />
        </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={() => navigate('/')}>Cancel</button>
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Posting...' : 'Post Resource'}
          </button>
        </div>
      </form>
    </div>
  );
};
