import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './DashboardLayout.css';

const CUSTOMER_NAV = [
  { path: '/dashboard', icon: HomeIcon, label: 'Home' },
  { path: '/bookings', icon: BookIcon, label: 'Bookings' },
  { path: '/packages', icon: StarIcon, label: 'Services' },
  { path: '/profile', icon: UserIcon, label: 'Profile' },
];

const ADMIN_NAV = [
  { path: '/admin', icon: HomeIcon, label: 'Dashboard' },
  { path: '/admin/bookings', icon: BookIcon, label: 'Bookings' },
  { path: '/admin/workers', icon: WorkerIcon, label: 'Workers' },
  { path: '/admin/packages', icon: StarIcon, label: 'Packages' },
  { path: '/admin/users', icon: UserIcon, label: 'Users' },
];

const WORKER_NAV = [
  { path: '/worker', icon: HomeIcon, label: 'Dashboard' },
  { path: '/worker/jobs', icon: BookIcon, label: 'My Jobs' },
];

function HomeIcon() { return <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M2 7.5L9 2l7 5.5V16a1 1 0 01-1 1H3a1 1 0 01-1-1V7.5z"/><path d="M6 17V9h6v8"/></svg>; }
function BookIcon() { return <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6"><rect x="2" y="2" width="14" height="14" rx="2"/><path d="M6 6h6M6 9h6M6 12h4"/></svg>; }
function StarIcon() { return <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M9 2l2.1 4.3L16 7.1l-3.5 3.4.8 4.8L9 13l-4.3 2.3.8-4.8L2 7.1l4.9-.8L9 2z"/></svg>; }
function UserIcon() { return <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="9" cy="6" r="3.5"/><path d="M2 16c0-3.6 3.1-6.5 7-6.5s7 2.9 7 6.5"/></svg>; }
function WorkerIcon() { return <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="9" cy="6" r="3"/><path d="M3 17c0-3 2.7-5 6-5s6 2 6 5"/><circle cx="14" cy="5" r="2" fill="currentColor" stroke="none"/></svg>; }

export default function DashboardLayout({ children, title }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const nav = user?.role === 'admin' ? ADMIN_NAV : user?.role === 'worker' ? WORKER_NAV : CUSTOMER_NAV;

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <div className="dl">
      {/* Sidebar */}
      <aside className={`dl__sidebar ${sidebarOpen ? 'dl__sidebar--open' : ''}`}>
        <div className="dl__sidebar-top">
          <Link to="/" className="dl__brand">
            <span className="dl__brand-mark">D</span>
            <span>DoorWash</span>
          </Link>
          <button className="dl__sidebar-close" onClick={() => setSidebarOpen(false)}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4l10 10M14 4L4 14"/></svg>
          </button>
        </div>

        <div className="dl__user-card">
          <div className="dl__user-avatar">{user?.name?.charAt(0)}</div>
          <div>
            <div className="dl__user-name">{user?.name}</div>
            <div className="dl__user-role">{user?.role}</div>
          </div>
          {user?.role === 'customer' && (
            <div className="dl__loyalty">
              <span className="dl__loyalty-pts">{user?.loyaltyPoints || 0}</span>
              <span className="dl__loyalty-label">pts</span>
            </div>
          )}
        </div>

        <nav className="dl__nav">
          {nav.map(({ path, icon: Icon, label }) => (
            <Link
              key={path}
              to={path}
              className={`dl__nav-item ${location.pathname === path ? 'dl__nav-item--active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        <button onClick={handleLogout} className="dl__logout">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M6 14H3a1 1 0 01-1-1V3a1 1 0 011-1h3M10 11l3-3-3-3M13 8H6"/></svg>
          Sign Out
        </button>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className="dl__overlay" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <main className="dl__main">
        <header className="dl__header">
          <button className="dl__menu-btn" onClick={() => setSidebarOpen(true)}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 5h14M3 10h14M3 15h14"/></svg>
          </button>
          <h1 className="dl__page-title">{title}</h1>
          <Link to="/packages" className="dl__header-cta">+ Book Wash</Link>
        </header>
        <div className="dl__content">
          {children}
        </div>
      </main>
    </div>
  );
}
