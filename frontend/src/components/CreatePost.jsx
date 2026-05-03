import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

export const CreatePost = () => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleCreatePost = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    try {
      await api.createPost(title, body);
      // Navigate back to the feed on success
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
        <p>Share study materials, notes, or tips with the AAU community.</p>
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
            required
            maxLength={100}
          />
        </div>

        <div className="form-group">
          <label>Description / Content</label>
          <textarea 
            placeholder="Describe your resource... (HTML tags will be rendered as plain text demonstrating XSS protection)"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            maxLength={2000}
            rows={8}
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
