import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './PackagesPage.css';

const TIER_COLORS = { basic: '#AEAEB2', premium: '#C8F04A', luxury: '#FFD700' };

export default function PackagesPage() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/packages')
      .then(res => setPackages(res.data.packages))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleBook = (pkgId) => {
    if (!user) {
      // Save intended destination, redirect to login
      navigate('/login', { state: { from: `/book/${pkgId}` } });
    } else {
      navigate(`/book/${pkgId}`);
    }
  };

  const filtered = filter === 'all'
    ? packages
    : filter === 'subscription'
    ? packages.filter(p => p.isSubscription)
    : packages.filter(p => p.tier === filter);

  return (
    <div className="packages-page">
      <Navbar />

      <div className="packages-page__hero">
        <div className="container">
          <span className="section__tag">Services</span>
          <h1 className="packages-page__title">Choose your standard</h1>
          <p className="packages-page__sub">
            Premium-grade products. Certified washers. At your doorstep.
          </p>
          <div className="packages-page__filters">
            {['all', 'basic', 'premium', 'luxury', 'subscription'].map(f => (
              <button
                key={f}
                className={`filter-btn ${filter === f ? 'filter-btn--active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {f === 'subscription' ? 'Monthly Plans' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '48px', paddingBottom: '80px' }}>
        {loading ? (
          <div className="packages-page__loading">
            {[...Array(4)].map((_, i) => <div key={i} className="pkg-skeleton" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="packages-page__empty">
            <p>No packages in this category yet.</p>
          </div>
        ) : (
          <div className="packages-page__grid">
            {filtered.map(pkg => (
              <div
                key={pkg._id}
                className={`pkg-full-card ${pkg.tier === 'luxury' ? 'pkg-full-card--luxury' : ''} ${pkg.tier === 'premium' ? 'pkg-full-card--premium' : ''}`}
              >
                {pkg.isSubscription && <div className="pkg-full-card__badge">Monthly Club</div>}
                {pkg.discountPercent > 0 && !pkg.isSubscription && (
                  <div className="pkg-full-card__discount-badge">{pkg.discountPercent}% OFF</div>
                )}

                <div className="pkg-full-card__header">
                  <div>
                    <span className="pkg-full-card__tier" style={{ color: TIER_COLORS[pkg.tier] || '#AEAEB2' }}>
                      {pkg.tier?.toUpperCase()}
                    </span>
                    <h2 className="pkg-full-card__name">{pkg.name}</h2>
                  </div>
                  <div className="pkg-full-card__price-block">
                    <span className="pkg-full-card__price">
                      ₹{pkg.price?.toLocaleString('en-IN')}
                    </span>
                    <span className="pkg-full-card__time">
                      {pkg.isSubscription ? `${pkg.subscriptionWashes || 4} washes/mo` : `${pkg.duration} min`}
                    </span>
                  </div>
                </div>

                <p className="pkg-full-card__desc">{pkg.description}</p>

                <div className="pkg-full-card__vehicles">
                  {pkg.vehicleTypes?.map(v => (
                    <span key={v} className="vehicle-tag">{v}</span>
                  ))}
                </div>

                <ul className="pkg-full-card__features">
                  {pkg.services?.map(s => (
                    <li key={s}>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                        <path d="M3 8l3.5 3.5L13 4" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {s}
                    </li>
                  ))}
                </ul>

                <button
                  className="pkg-full-card__cta"
                  onClick={() => handleBook(pkg._id)}
                >
                  {user ? 'Book This Wash' : 'Book Now — Sign In Free'}
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 8h10M9 4l4 4-4 4"/>
                  </svg>
                </button>

                {!user && (
                  <p className="pkg-full-card__signin-note">
                    Free account · No credit card required to sign up
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
