import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './AuthPage.css';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Where to go after login — default to dashboard
  const from = location.state?.from || null;

  const onChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}! 👋`);
      // If they came from a booking page, go there; else go to role dashboard
      if (from) {
        navigate(from, { replace: true });
      } else if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'worker') {
        navigate('/worker');
      } else {
        navigate('/dashboard');
      }
    } catch {
      // handled by axios interceptor
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-bg__orb auth-bg__orb--1" />
        <div className="auth-bg__orb auth-bg__orb--2" />
      </div>

      <div className="auth-card">
        <Link to="/" className="auth-logo">
          <span className="auth-logo__mark">D</span>
          <span>DoorWash</span>
        </Link>

        <h1 className="auth-title">Welcome back</h1>
        <p className="auth-sub">
          {from ? 'Sign in to continue booking your wash' : 'Sign in to manage your bookings'}
        </p>

        {/* Quick test credentials */}
        <div className="auth-demo-creds">
          <p className="auth-demo-label">Quick test logins:</p>
          <div className="auth-demo-btns">
            <button type="button" className="auth-demo-btn"
              onClick={() => setForm({ email: 'customer@doorwash.in', password: 'Customer@1234' })}>
              Customer
            </button>
            <button type="button" className="auth-demo-btn"
              onClick={() => setForm({ email: 'admin@doorwash.in', password: 'Admin@1234' })}>
              Admin
            </button>
            <button type="button" className="auth-demo-btn"
              onClick={() => setForm({ email: 'rahul@doorwash.in', password: 'Worker@1234' })}>
              Worker
            </button>
          </div>
        </div>

        <form onSubmit={onSubmit} className="auth-form">
          <div className="auth-field">
            <label>Email address</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
              placeholder="you@example.com"
              required
              autoComplete="email"
            />
          </div>
          <div className="auth-field">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={onChange}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>
          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? <span className="auth-spinner" /> : 'Sign In'}
          </button>
        </form>

        <p className="auth-switch">
          Don't have an account? <Link to="/register" state={{ from }}>Create one free</Link>
        </p>
      </div>
    </div>
  );
}
