import React, { useState, useEffect } from 'react';
import { mockApi } from '../services/mockApi';
import { SearchBar } from './SearchBar';

export const ResourceFeed = ({ currentRole }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Post Submission State
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState(null);

  const loadPosts = async (searchQuery = "") => {
    setLoading(true);
    try {
      const data = await mockApi.getPosts(searchQuery);
      setPosts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleCreatePost = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await mockApi.createPost(title, body, currentRole);
      setTitle('');
      setBody('');
      loadPosts();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="feed-container">
      <h2>Resource Feed</h2>
      
      <SearchBar onSearch={loadPosts} />

      {(currentRole === 'Admin' || currentRole === 'User') && (
        <form onSubmit={handleCreatePost} className="create-post-form">
          <h3>Create New Resource</h3>
          {error && <div className="error-banner">{error}</div>}
          <input 
            type="text" 
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={100}
          />
          <textarea 
            placeholder="Post body (HTML tags will be rendered as plain text demonstrating XSS protection)..."
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
            maxLength={2000}
          />
          <button type="submit">Post Resource</button>
        </form>
      )}

      {loading ? (
        <p>Loading posts...</p>
      ) : (
        <div className="posts-list">
          {posts.length === 0 ? <p>No posts found.</p> : null}
          {posts.map(post => (
            <div key={post.id} className="post-card">
              <h4>{post.title}</h4>
              {/* React automatically uses Node.textContent underneath when rendering strings inside JSX tags, protecting against XSS natively. */}
              <p className="post-body">{post.body}</p>
              <small>Posted by: {post.author}</small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
