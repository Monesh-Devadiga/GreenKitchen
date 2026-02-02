import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register } from '../api/api';
import './Auth.css';

const Auth = ({ onAuth }) => {
  const [mode, setMode] = useState('login');
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setFormData({ username: '', email: '', password: '' });
    setStatus({ type: '', message: '' });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      if (mode === 'login') {
        const { data } = await login({ email: formData.email, password: formData.password });
        localStorage.setItem('greenkitchen_token', data.token);
        localStorage.setItem('greenkitchen_user', JSON.stringify(data.user));
        if (onAuth) {
          onAuth(data.user);
        }
        setStatus({ type: 'success', message: `Welcome back, ${data.user.username}!` });
      } else {
        const { data } = await register(formData);
        localStorage.setItem('greenkitchen_token', data.token);
        localStorage.setItem('greenkitchen_user', JSON.stringify(data.user));
        if (onAuth) {
          onAuth(data.user);
        }
        setStatus({ type: 'success', message: `Account created for ${data.user.username}.` });
      }
      navigate('/');
    } catch (error) {
      const message = error.response?.data?.error || 'Something went wrong. Please try again.';
      setStatus({ type: 'error', message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>{mode === 'login' ? 'Welcome back to GreenKitchen' : 'Join the GreenKitchen community'}</h2>
          <p>
            {mode === 'login'
              ? 'Sign in to add reviews, manage recipes, and save your favorites.'
              : 'Create an account to start sharing your own fresh recipes.'}
          </p>
        </div>

        {status.message && (
          <div className={`auth-status ${status.type}`}>
            {status.message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="e.g. freshchef42"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter a secure password"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="auth-toggle">
          {mode === 'login' ? (
            <>
              New to GreenKitchen?{' '}
              <button onClick={toggleMode}>Create an account</button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button onClick={toggleMode}>Sign in instead</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;

