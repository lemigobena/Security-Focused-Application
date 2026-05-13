import React, { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { Eye, EyeOff } from "lucide-react";

export const AuthForms = ({ onLoginSuccess, initialMode = "login" }) => {
  const [isLogin, setIsLogin] = useState(initialMode === "login");

  // States mapping directly to security limits and requirements
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const passwordRequirements = [
    { label: 'At least 8 characters', regex: /.{8,}/ },
    { label: 'At least one capital letter', regex: /[A-Z]/ },
    { label: 'At least one small letter', regex: /[a-z]/ },
    { label: 'At least one number', regex: /\d/ },
    { label: 'At least one special character', regex: /[@$!%*?&]/ },
  ];

  const isPasswordStrong = passwordRequirements.every(req => req.regex.test(password));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (!agreedToTerms) {
      return setError("You must agree to the Terms of Use to proceed.");
    }

    if (!isLogin && !isPasswordStrong) {
      return setError("Password must be at least 8 characters and include a capital letter, a small letter, a number, and a special character.");
    }

    try {
      if (isLogin) {
        // Attempt login
        const res = await api.login(email, password, agreedToTerms);
        if (res.user) {
          onLoginSuccess(res.user);
        }
      } else {
        // Validation check for registration before calling API
        const userRegex = /^[a-zA-Z0-9_]+$/;
        if (!userRegex.test(username)) {
          return setError(
            "Username can only contain alphanumeric characters and underscores.",
          );
        }

        await api.register(username, email, password, agreedToTerms);
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
              onChange={(e) => setUsername(e.target.value)}
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
            onChange={(e) => setEmail(e.target.value)}
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
              onChange={(e) => setPassword(e.target.value)}
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
          
          {!isLogin && (
            <div className="password-strength-checker signup-strength">
              <p className="strength-title">Required for security:</p>
              <ul className="requirements-list">
                {passwordRequirements.map((req, idx) => {
                  const isMet = req.regex.test(password);
                  return (
                    <li key={idx} className={`requirement-item ${isMet ? 'met' : 'unmet'}`}>
                      <div className={`status-dot ${isMet ? 'met' : 'unmet'}`}></div>
                      {req.label}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        <div className="form-group-checkbox">
          <input 
            type="checkbox" 
            id="terms" 
            checked={agreedToTerms} 
            onChange={(e) => setAgreedToTerms(e.target.checked)} 
            required
          />
          <label htmlFor="terms">I agree to the <Link to="/terms" target="_blank">Terms of Use</Link></label>
        </div>

        <button 
          type="submit" 
          className="btn-primary"
        >
          {isLogin ? "Log In" : "Register"}
        </button>
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
