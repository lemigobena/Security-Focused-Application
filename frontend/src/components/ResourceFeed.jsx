import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { SearchBar } from './SearchBar';
import { Modal } from './Modal';
import { StoriesHeader } from './StoriesHeader';
import { PostCard } from './PostCard';
import { PlusCircle, Inbox, Download, X } from 'lucide-react';

export const ResourceFeed = ({ currentRole }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);

  const [fileType, setFileType] = useState('');
  const [bookmarks, setBookmarks] = useState([]);

  const loadBookmarks = async () => {
    try {
      const data = await api.getBookmarks();
      setBookmarks(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleBookmark = async (postId) => {
    // Optimistic update: toggle the bookmark locally first
    const wasBookmarked = bookmarks.some(b => b.postId === postId);
    
    if (wasBookmarked) {
      setBookmarks(prev => prev.filter(b => b.postId !== postId));
    } else {
      // Add a temporary bookmark record
      setBookmarks(prev => [...prev, { postId, id: Date.now() }]);
    }

    try {
      await api.toggleBookmark(postId);
      // Refresh from server to ensure ID consistency
      loadBookmarks();
    } catch (err) {
      console.error(err);
      // Revert on error
      loadBookmarks();
      alert("Failed to update bookmark");
    }
  };

  useEffect(() => {
    loadBookmarks();
  }, []);

  const loadPosts = async (searchQuery = "", type = fileType) => {
    setLoading(true);
    try {
      const data = await api.getPosts(searchQuery, type);
      setPosts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, [fileType]);

  const confirmDelete = async () => {
// ...
    if (!postToDelete) return;
    try {
      await api.suspendPost(postToDelete, true);
      loadPosts();
    } catch (err) {
      alert("Failed to suspend post: " + err);
    } finally {
      setPostToDelete(null);
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <div className="feed-layout">
      <StoriesHeader />
      
      <div className="feed-container">
        <div className="feed-header-row">
          <h2>Resources</h2>
          {(currentRole === 'USER') && (
            <Link to="/create-post" className="btn-primary flex-btn">
              <PlusCircle size={18} />
              Share
            </Link>
          )}
        </div>
        
        <div className="feed-filters">
          <button className={fileType === '' ? 'active' : ''} onClick={() => setFileType('')}>All</button>
          <button className={fileType === 'image' ? 'active' : ''} onClick={() => setFileType('image')}>Images</button>
          <button className={fileType === 'video' ? 'active' : ''} onClick={() => setFileType('video')}>Videos</button>
          <button className={fileType === 'application' ? 'active' : ''} onClick={() => setFileType('application')}>Documents</button>
        </div>

        <SearchBar onSearch={(q) => loadPosts(q, fileType)} />

        {loading ? (
          <div className="loading-state">Loading resources...</div>
        ) : (
          <div className="posts-list">
            {posts.length === 0 ? (
              <div className="empty-state">
                <Inbox size={48} className="empty-icon" />
                <h3>No resources found</h3>
                <p>Try a different search or be the first to share something!</p>
              </div>
            ) : null}
            
            {posts.map(post => (
              <PostCard 
                key={post.id} 
                post={post} 
                onOpen={setSelectedPost}
                onBookmark={handleToggleBookmark}
                isBookmarked={(bookmarks || []).some(b => b.postId === post.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Post Detail Modal */}
      {selectedPost && (
        <div className="post-detail-overlay" onClick={() => setSelectedPost(null)}>
          <div className="post-detail-content" onClick={e => e.stopPropagation()}>
            <button className="close-detail-btn" onClick={() => setSelectedPost(null)}>
              <X size={24} />
            </button>
            
            <div className="detail-media">
              {selectedPost.file ? (
                selectedPost.file.mimetype.includes('image') ? (
                  <img src={selectedPost.file.path} alt={selectedPost.title} />
                ) : (
                  <div className="detail-file-placeholder">
                    <span>{selectedPost.file.filename}</span>
                  </div>
                )
              ) : (
                <div className="detail-text-placeholder">
                  <h2>{selectedPost.title}</h2>
                </div>
              )}
            </div>

            <div className="detail-info">
              <div className="detail-header">
                <div className="detail-user">
                  <div className="detail-avatar">
                    {selectedPost.author?.profilePhotoUrl ? (
                      <img src={selectedPost.author.profilePhotoUrl} alt="" className="avatar-img-detail" />
                    ) : (
                      selectedPost.author?.username?.[0]
                    )}
                  </div>
                  <strong>{selectedPost.author?.username}</strong>
                </div>
                {currentRole === 'ADMIN' && (
                  <button onClick={() => {
                    setPostToDelete(selectedPost.id);
                    setIsDeleteModalOpen(true);
                  }} className="btn-suspend">Suspend</button>
                )}
              </div>
              
              <div className="detail-body">
                <h3>{selectedPost.title}</h3>
                <p>{selectedPost.body}</p>
                
                {selectedPost.detectedLinks?.length > 0 && (
                  <div className="detected-links">
                    <strong>Links found:</strong>
                    <ul>
                      {selectedPost.detectedLinks.map((link, i) => (
                        <li key={i}><a href={link} target="_blank" rel="noopener noreferrer">{link}</a></li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {selectedPost.file && (
                <div className="detail-actions">
                  <a 
                    href={selectedPost.file.path} 
                    download={selectedPost.file.filename}
                    className="btn-primary download-btn"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Download size={18} />
                    Download {selectedPost.file.mimetype.split('/')[1].toUpperCase()}
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Modal 
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Suspend Resource?"
        message="Are you sure you want to suspend this study resource? It will be hidden from the feed and logged."
        type="danger"
      />
    </div>
  );
};
