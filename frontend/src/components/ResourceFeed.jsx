import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { SearchBar } from './SearchBar';
import { Modal } from './Modal';
import { Trash2, PlusCircle, Inbox } from 'lucide-react';

export const ResourceFeed = ({ currentRole }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);

  const loadPosts = async (searchQuery = "") => {
    setLoading(true);
    try {
      const data = await api.getPosts(searchQuery);
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

  const handleDeleteClick = (id) => {
    setPostToDelete(id);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!postToDelete) return;
    try {
      await api.deletePost(postToDelete);
      loadPosts();
    } catch (err) {
      alert("Failed to delete post: " + err);
    } finally {
      setPostToDelete(null);
    }
  };

  return (
    <div className="feed-container">
      <div className="feed-header-row">
        <h2>Resource Feed</h2>
        {(currentRole === 'USER') && (
          <Link to="/create-post" className="btn-primary flex-btn">
            <PlusCircle size={18} />
            Post Resource
          </Link>
        )}
      </div>
      
      <SearchBar onSearch={loadPosts} />

      {loading ? (
        <div className="loading-state">Loading resources...</div>
      ) : (
        <div className="posts-list">
          {posts.length === 0 ? (
            <div className="empty-state">
              <Inbox size={48} className="empty-icon" />
              <h3>No resources yet</h3>
              <p>It looks a little quiet here. Share your study materials or tips!</p>
              {(currentRole === 'USER') && (
                <Link to="/create-post" className="btn-primary empty-btn">
                  Be the first to post
                </Link>
              )}
            </div>
          ) : null}
          
          {posts.map(post => (
            <div key={post.id} className="post-card">
              <div className="post-header">
                <h4>{post.title}</h4>
                {currentRole === 'ADMIN' && (
                  <button onClick={() => handleDeleteClick(post.id)} className="delete-btn" aria-label="Delete resource">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <p className="post-body">{post.body}</p>
              <div className="post-footer">
                <small>Shared by: {post.author?.username || 'Unknown'}</small>
                <small className="post-date">{new Date(post.createdAt).toLocaleDateString()}</small>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={confirmDelete}
        title="Delete Resource?"
        message="Are you sure you want to remove this study resource? This action cannot be undone and will be logged in the system audit trail."
        type="danger"
      />
    </div>
  );
};
