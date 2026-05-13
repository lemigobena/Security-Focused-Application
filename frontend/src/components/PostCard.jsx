import React from 'react';
import { Bookmark, MoreHorizontal, FileText } from 'lucide-react';

export const PostCard = ({ post, onOpen, onBookmark, isBookmarked }) => {
  const headerSnippet = post.body && post.body.length > 60 ? post.body.substring(0, 60) + "..." : post.body;

  // Safety for avatar initial
  const avatarInitial = post.author?.username ? post.author.username[0].toUpperCase() : '?';

  return (
    <div className="post-card" onClick={() => onOpen(post)}>
      <div className="post-header">
        <div className="post-user-info">
          <div className="post-avatar">
            {post.author?.profilePhotoUrl ? (
              <img src={post.author.profilePhotoUrl} alt="" className="avatar-img-sm" />
            ) : (
              avatarInitial
            )}
          </div>
          <div className="post-meta-top">
            <div className="post-user-title">
              <span className="post-username">{post.author?.username || 'Deleted Account'}</span>
              <span className="post-title-header">• {post.title}</span>
            </div>
            <p className="post-snippet">{headerSnippet}</p>
          </div>
        </div>
        <MoreHorizontal size={20} className="post-more" />
      </div>

      <div className="post-content">
        {post.file ? (
          <div className="post-media-container">
            {post.file.mimetype.includes('image') && <img src={post.file.path} alt={post.title} className="post-media" />}
            {post.file.mimetype.includes('video') && <video src={post.file.path} controls className="post-media" />}
            {!post.file.mimetype.includes('image') && !post.file.mimetype.includes('video') && (
              <div className="file-placeholder">
                <span className="file-type-tag">{(post.file.filename || '').split('.').pop()}</span>
                <FileText size={64} className="file-icon-logo" />
                <div className="file-info-badge">
                  {post.file.filename}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-content-placeholder">
            <FileText size={40} className="text-icon" />
            <p>Click to read full description</p>
          </div>
        )}
      </div>

      <div className="post-action-bar">
        <button 
          className={`action-btn bookmark-btn ${isBookmarked ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onBookmark(post.id);
          }}
        >
          <Bookmark size={24} fill={isBookmarked ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="post-info-footer">
        <span className="post-username-footer">{post.author?.username || 'Deleted Account'}</span>
        <span className="post-body-full">{post.body}</span>
      </div>
    </div>
  );
};
