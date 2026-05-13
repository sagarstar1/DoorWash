import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './AuthPage.css';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/dashboard';

  const onChange = e => {
    setForm(p => ({ ...p, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) setErrors(p => ({ ...p, [e.target.name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Valid email required';
    if (!form.phone.trim()) errs.phone = 'Phone is required';
    if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const onSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await register(form);
      toast.success('Welcome to DoorWash! 🚗');
      navigate(from, { replace: true });
    } catch {
      // handled by interceptor
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

        <h1 className="auth-title">Create account</h1>
        <p className="auth-sub">Join thousands of happy car owners</p>

        <form onSubmit={onSubmit} className="auth-form">
          <div className="auth-field">
            <label>Full name</label>
            <input type="text" name="name" value={form.name} onChange={onChange}
              placeholder="Rahul Sharma" autoComplete="name" />
            {errors.name && <span className="auth-error">{errors.name}</span>}
          </div>
          <div className="auth-field">
            <label>Email address</label>
            <input type="email" name="email" value={form.email} onChange={onChange}
              placeholder="you@example.com" autoComplete="email" />
            {errors.email && <span className="auth-error">{errors.email}</span>}
          </div>
          <div className="auth-field">
            <label>Phone number</label>
            <input type="tel" name="phone" value={form.phone} onChange={onChange}
              placeholder="+91 98765 43210" autoComplete="tel" />
            {errors.phone && <span className="auth-error">{errors.phone}</span>}
          </div>
          <div className="auth-field">
            <label>Password</label>
            <input type="password" name="password" value={form.password} onChange={onChange}
              placeholder="Min. 6 characters" autoComplete="new-password" />
            {errors.password && <span className="auth-error">{errors.password}</span>}
          </div>
          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? <span className="auth-spinner" /> : 'Create Account — Free'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account? <Link to="/login" state={{ from }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
