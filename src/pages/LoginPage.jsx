"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext.jsx"
import { MessageCircle, Mail, Lock, AlertCircle, Eye, EyeOff } from "lucide-react"

const LoginPage = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!email || !password) {
      setError("Please fill in all fields")
      return
    }

    setLoading(true)
    setError("")

    try {
      const { error } = await signIn(email, password)

      if (error) {
        setError(error.message)
      }
      // If successful, the user will be redirected by the ProtectedRoute logic
    } catch (err) {
      console.error("Login error:", err)
      setError("An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <div className="logo-container">
              <MessageCircle size={48} className="logo-icon" />
            </div>
            <h1 className="login-title">Welcome Back</h1>
            <p className="login-subtitle">Sign in to access zone safety reports and community insights</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email Address
              </label>
              <div className="input-container">
                <Mail size={20} className="input-icon" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="form-input"
                  placeholder="Enter your email"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="input-container">
                <Lock size={20} className="input-icon" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="form-input"
                  placeholder="Enter your password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="error-message">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? <div className="loading-spinner" /> : "Sign In"}
            </button>
          </form>

          <div className="login-footer">
            <p>
              Don't have an account?{" "}
              <Link to="/register" className="signup-link">
                Create one here
              </Link>
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          position: relative;
          overflow: hidden;
        }

        .login-page::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 50%);
          animation: float 20s ease-in-out infinite;
        }

        .login-container {
          width: 100%;
          max-width: 420px;
          position: relative;
          z-index: 1;
        }

        .login-card {
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 24px;
          padding: 40px;
          box-shadow: 
            0 20px 25px -5px rgba(0, 0, 0, 0.1),
            0 10px 10px -5px rgba(0, 0, 0, 0.04),
            0 0 0 1px rgba(255, 255, 255, 0.05);
          transition: all 0.3s ease;
        }

        .login-card:hover {
          transform: translateY(-2px);
          box-shadow: 
            0 25px 50px -12px rgba(0, 0, 0, 0.15),
            0 0 0 1px rgba(255, 255, 255, 0.1);
        }

        .login-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .logo-container {
          margin-bottom: 16px;
        }

        .logo-icon {
          color: #3b82f6;
          filter: drop-shadow(0 4px 8px rgba(59, 130, 246, 0.3));
        }

        .login-title {
          font-size: 28px;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 8px;
          background: linear-gradient(135deg, #1e293b, #475569);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .login-subtitle {
          color: #64748b;
          font-size: 16px;
          line-height: 1.5;
        }

        .login-form {
          margin-bottom: 24px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #374151;
          font-size: 14px;
        }

        .input-container {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 16px;
          color: #9ca3af;
          z-index: 2;
        }

        .form-input {
          width: 100%;
          padding: 16px 16px 16px 48px;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          background: #ffffff;
          color: #1f2937;
          font-size: 16px;
          transition: all 0.3s ease;
          outline: none;
        }

        .form-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          background: #fefefe;
        }

        .form-input::placeholder {
          color: #9ca3af;
        }

        .password-toggle {
          position: absolute;
          right: 16px;
          background: none;
          border: none;
          color: #9ca3af;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .password-toggle:hover {
          color: #6b7280;
          background: #f3f4f6;
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #dc2626;
          font-size: 14px;
          margin-bottom: 16px;
          padding: 12px 16px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
        }

        .login-button {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          position: relative;
          overflow: hidden;
        }

        .login-button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 10px 20px rgba(59, 130, 246, 0.4);
        }

        .login-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .loading-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .login-footer {
          text-align: center;
          color: #64748b;
        }

        .signup-link {
          color: #3b82f6;
          text-decoration: none;
          font-weight: 600;
          transition: color 0.2s ease;
        }

        .signup-link:hover {
          color: #1d4ed8;
          text-decoration: underline;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 480px) {
          .login-card {
            padding: 24px;
            border-radius: 16px;
          }
          
          .login-title {
            font-size: 24px;
          }
          
          .login-subtitle {
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  )
}

export default LoginPage
