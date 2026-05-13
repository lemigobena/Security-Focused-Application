import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';

export const StoriesHeader = () => {
  const [activeUsers, setActiveUsers] = useState([]);

  useEffect(() => {
    const loadActiveUsers = async () => {
      try {
        const users = await api.getActiveUsers();
        setActiveUsers(users);
      } catch (err) {
        console.error("Failed to load active users", err);
      }
    };
    loadActiveUsers();
  }, []);

  return (
    <div className="stories-container">
      {activeUsers.map(user => (
        <Link to={`/profile/${user.username}`} key={user.id} className="story-item">
          <div className="story-avatar-ring">
            <div className="story-avatar">
              {user.profilePhotoUrl ? (
                <img src={user.profilePhotoUrl} alt="" className="avatar-img-sm" />
              ) : (
                user.username ? user.username[0].toUpperCase() : '?'
              )}
            </div>
          </div>
          <span className="story-username">{user.username || 'User'}</span>
        </Link>
      ))}
    </div>
  );
};
