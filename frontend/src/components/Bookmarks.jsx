import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { PostCard } from './PostCard';
import { Bookmark, Inbox } from 'lucide-react';

export const Bookmarks = () => {
  const [bookmarkedPosts, setBookmarkedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBookmarks = async () => {
      try {
        const data = await api.getBookmarks();
        // The backend returns an array of bookmark objects { post: { ... } }
        setBookmarkedPosts(data.map(b => b.post));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadBookmarks();
  }, []);

  return (
    <div className="bookmarks-container">
      <div className="feed-header-row">
        <h2>Your Activities</h2>
        <p className="subtitle">Posts you have bookmarked for later.</p>
      </div>

      {loading ? (
        <div className="loading-state">Loading activities...</div>
      ) : (
        <div className="instagram-posts-list">
          {bookmarkedPosts.length === 0 ? (
            <div className="empty-state">
              <Bookmark size={48} className="empty-icon" />
              <h3>No bookmarks yet</h3>
              <p>When you see a post you like, click the bookmark icon to save it here.</p>
            </div>
          ) : (
            bookmarkedPosts.map(post => (
              <PostCard key={post.id} post={post} />
            ))
          )}
        </div>
      )}
    </div>
  );
};
