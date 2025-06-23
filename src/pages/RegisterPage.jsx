import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';
import { MessageCircle, Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const validateForm = () => {
    if (!formData.username || !formData.email || !formData.password || !formData.confirmPassword) {
      return 'Please fill in all fields';
    }

    if (formData.username.length < 3) {
      return 'Username must be at least 3 characters long';
    }

    if (formData.password.length < 6) {
      return 'Password must be at least 6 characters long';
    }

    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      return 'Please enter a valid email address';
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    const { error } = await signUp(formData.username, formData.email, formData.password);
    
    if (error) {
      setError(error.message);
    } else {
      setSuccess('Account created successfully! You are now logged in.');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card">
          <div className="card-header">
            <div className="flex items-center justify-center mb-4">
              <MessageCircle size={40} className="text-accent-blue" />
            </div>
            <h1 className="card-title">Create Account</h1>
            <p className="card-subtitle">Join us and start chatting with AI</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                <User size={16} style={{ display: 'inline', marginRight: '8px' }} />
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                className="form-input"
                placeholder="Choose a username"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                <Mail size={16} style={{ display: 'inline', marginRight: '8px' }} />
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="form-input"
                placeholder="Enter your email"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                <Lock size={16} style={{ display: 'inline', marginRight: '8px' }} />
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="form-input"
                placeholder="Create a password"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">
                <Lock size={16} style={{ display: 'inline', marginRight: '8px' }} />
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="form-input"
                placeholder="Confirm your password"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="error-message mb-4">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {success && (
              <div className="success-message mb-4">
                <CheckCircle size={16} />
                {success}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary w-full mb-4"
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div className="text-center">
            <p className="text-secondary">
              Already have an account?{' '}
              <Link to="/login" className="text-accent-blue hover:underline">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;