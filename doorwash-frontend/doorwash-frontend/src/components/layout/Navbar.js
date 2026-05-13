import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [location]);

  const isLanding = location.pathname === '/';

  const handleLogout = () => { logout(); navigate('/'); };

  const dashLink = user?.role === 'admin' ? '/admin' : user?.role === 'worker' ? '/worker' : '/dashboard';

  return (
    <nav className={`navbar ${scrolled || !isLanding ? 'navbar--scrolled' : ''} ${menuOpen ? 'navbar--open' : ''}`}>
      <div className="navbar__inner">
        <Link to="/" className="navbar__logo">
          <span className="navbar__logo-mark">D</span>
          <span>DoorWash</span>
        </Link>

        <div className="navbar__links">
          <Link to="/packages" className="navbar__link">Services</Link>
          <a href="#how-it-works" className="navbar__link">How It Works</a>
          <a href="#reviews" className="navbar__link">Reviews</a>
        </div>

        <div className="navbar__actions">
          {user ? (
            <>
              <Link to={dashLink} className="navbar__btn navbar__btn--ghost">Dashboard</Link>
              <button onClick={handleLogout} className="navbar__btn navbar__btn--outline">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar__btn navbar__btn--ghost">Sign In</Link>
              <Link to="/register" className="navbar__btn navbar__btn--accent">Get Started</Link>
            </>
          )}
        </div>

        <button className="navbar__hamburger" onClick={() => setMenuOpen(!menuOpen)}>
          <span /><span /><span />
        </button>
      </div>

      <div className="navbar__mobile">
        <Link to="/packages" className="navbar__mobile-link">Services</Link>
        <a href="#how-it-works" className="navbar__mobile-link">How It Works</a>
        <a href="#reviews" className="navbar__mobile-link">Reviews</a>
        {user ? (
          <>
            <Link to={dashLink} className="navbar__mobile-link">Dashboard</Link>
            <button onClick={handleLogout} className="navbar__mobile-cta">Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className="navbar__mobile-link">Sign In</Link>
            <Link to="/register" className="navbar__mobile-cta">Get Started</Link>
          </>
        )}
      </div>
    </nav>
  );
}
