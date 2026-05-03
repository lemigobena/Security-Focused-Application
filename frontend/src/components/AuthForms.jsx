import React, { useState } from 'react';
import { api } from '../services/api';
import { Eye, EyeOff } from 'lucide-react';

export const AuthForms = ({ onLoginSuccess, initialMode = 'login' }) => {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  
  // States mapping directly to security limits and requirements
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    try {
      if (isLogin) {
        // Attempt login
        const res = await api.login(email, password);
        if (res.user) {
          onLoginSuccess(res.user);
        } else if (res.id) {
          // Fallback if the backend returns the user object directly
          onLoginSuccess(res);
        }
      } else {
        // Validation check for registration before calling API
        const userRegex = /^[a-zA-Z0-9_]+$/;
        if (!userRegex.test(username)) {
           return setError("Username can only contain alphanumeric characters and underscores.");
        }
        
        await api.register(username, email, password);
        setMessage("Registration successful! You can now log in.");
        setIsLogin(true); // switch to login form
      }
    } catch (err) {
      // Show generic error or block out for 15 minutes (429 handling)
      setError(err);
    }
  };

  return (
    <div className="auth-container">
      <h2>{isLogin ? "Login" : "Register"}</h2>
      {error && <div className="error-banner">{error}</div>}
      {message && <div className="success-banner">{message}</div>}

      <form onSubmit={handleSubmit} className="auth-form">
        {!isLogin && (
          <div className="form-group">
            <label>Username</label>
            <input 
              type="text" 
              value={username} 
              onChange={e => setUsername(e.target.value)}
              maxLength={20}
              required
            />
          </div>
        )}

        <div className="form-group">
          <label>Email</label>
          <input 
            type="email" 
            value={email} 
            onChange={e => setEmail(e.target.value)}
            maxLength={100}
            required
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <div className="password-input-wrapper">
            <input 
              type={showPassword ? "text" : "password"} 
              value={password} 
              onChange={e => setPassword(e.target.value)}
              minLength={8}
              maxLength={128}
              required
            />
            <button 
              type="button" 
              className="toggle-password-btn"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button type="submit" className="btn-primary">{isLogin ? "Log In" : "Register"}</button>
      </form>
      
      <p>
        {isLogin ? "Don't have an account? " : "Already have an account? "}
        <button className="link-btn" onClick={() => setIsLogin(!isLogin)}>
          {isLogin ? "Sign up here" : "Log in here"}
        </button>
      </p>
    </div>
  );
};
