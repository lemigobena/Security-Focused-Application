import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { PostCard } from './PostCard';
import { Grid, Settings, Bookmark, Layout, X } from 'lucide-react';

export const Profile = ({ currentUser }) => {
  const { username } = useParams();
  const isOwnProfile = currentUser?.username === username;
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [selectedPost, setSelectedPost] = useState(null);

  const [savedPosts, setSavedPosts] = useState([]);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const data = await api.getProfile(username);
        if (data) {
          setProfile(data);
          setPosts(data.posts || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [username]);

  useEffect(() => {
    if (activeTab === 'bookmarks' && isOwnProfile) {
      const loadBookmarks = async () => {
        try {
          const data = await api.getBookmarks();
          // Extract the actual post objects from the bookmark records
          const bookmarkedPosts = data.map(b => b.post);
          setSavedPosts(bookmarkedPosts);
        } catch (err) {
          console.error("Failed to load bookmarks", err);
        }
      };
      loadBookmarks();
    }
  }, [activeTab, isOwnProfile]);

  if (loading) return <div className="loading-state">Loading profile...</div>;
  if (!profile) return <div className="empty-state">User not found</div>;

  return (
    <div className="profile-container">
      <header className="profile-header">
        <div className="profile-avatar-large">
          {profile.profilePhotoUrl ? (
            <img src={profile.profilePhotoUrl} alt={profile.username} className="avatar-img-full" />
          ) : (
            profile.username ? profile.username[0].toUpperCase() : '?'
          )}
        </div>
        <div className="profile-details">
          <div className="profile-title-row">
            <h2>{profile.username}</h2>
            {isOwnProfile && (
              <div className="profile-actions">
                <Link to="/settings" className="icon-btn" title="Settings"><Settings size={20} /></Link>
              </div>
            )}
          </div>
          <div className="profile-bio">
            <p>{profile.bio || "No bio yet."}</p>
          </div>
          <div className="profile-stats">
            <span><strong>{posts.length}</strong> posts</span>
          </div>
        </div>
      </header>

      <div className="profile-tabs">
        <button 
          className={activeTab === 'posts' ? 'active' : ''} 
          onClick={() => setActiveTab('posts')}
        >
          <Grid size={18} /> POSTS
        </button>
        {isOwnProfile && (
          <button 
            className={activeTab === 'bookmarks' ? 'active' : ''} 
            onClick={() => setActiveTab('bookmarks')}
          >
            <Bookmark size={18} /> SAVED
          </button>
        )}
      </div>

      <div className="profile-posts-grid">
        {(activeTab === 'posts' ? posts : savedPosts).map(post => (
          <div key={post.id} className="grid-post-item" onClick={() => setSelectedPost(post)}>
            {post.file?.mimetype.includes('image') ? (
              <img src={post.file.path} alt={post.title} />
            ) : (
              <div className="grid-text-placeholder">
                <span>{post.title}</span>
              </div>
            )}
            <div className="grid-overlay">
              <div className="grid-meta">
                <Layout size={20} />
                <span>View</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Reusing Post Detail Modal Logic */}
      {selectedPost && (
        <div className="post-detail-overlay" onClick={() => setSelectedPost(null)}>
          <div className="post-detail-content" onClick={e => e.stopPropagation()}>
            <button className="close-detail-btn" onClick={() => setSelectedPost(null)}>
              <X size={24} />
            </button>
            <div className="detail-media">
              {selectedPost.file ? (
                <img src={selectedPost.file.path} alt={selectedPost.title} />
              ) : (
                <div className="detail-text-placeholder"><h2>{selectedPost.title}</h2></div>
              )}
            </div>
            <div className="detail-info">
              <div className="detail-header">
                <div className="detail-user">
                  <div className="detail-avatar">{selectedPost.author?.username ? selectedPost.author.username[0].toUpperCase() : '?'}</div>
                  <strong>{selectedPost.author?.username || 'Deleted Account'}</strong>
                </div>
              </div>
              <div className="detail-body">
                <h3>{selectedPost.title}</h3>
                <p>{selectedPost.body}</p>
              </div>
              {selectedPost.file && (
                <div className="detail-actions">
                  <a href={selectedPost.file.path} download className="btn-primary download-btn">
                    Download
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
