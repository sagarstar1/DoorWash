import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import './LandingPage.css';

const STATS = [
  { value: '4,800+', label: 'Vehicles Washed' },
  { value: '98%', label: 'Satisfaction Rate' },
  { value: '45 min', label: 'Avg. Service Time' },
  { value: '24/7', label: 'Booking Available' },
];

const STEPS = [
  {
    num: '01',
    title: 'Choose a Package',
    desc: 'Pick from Basic, Premium, or Luxury — all using professional-grade products.',
    img: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=400&q=80',
    alt: 'Car wash packages',
  },
  {
    num: '02',
    title: 'Book a Slot',
    desc: 'Select your time, share your location, and we handle the rest.',
    img: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&q=80',
    alt: 'Book on phone',
  },
  {
    num: '03',
    title: 'Track Live',
    desc: 'Watch your assigned washer travel to you on a live map.',
    img: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=400&q=80',
    alt: 'Live tracking map',
  },
  {
    num: '04',
    title: 'Sparkling Result',
    desc: 'Sit back. Your vehicle gets a showroom finish at your doorstep.',
    img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
    alt: 'Clean sparkling car',
  },
];

const REVIEWS = [
  { name: 'Ananya S.', vehicle: 'Mercedes C-Class', rating: 5, text: 'Absolutely impeccable service. The Luxury Detail left my car looking better than the showroom. Worth every rupee.' },
  { name: 'Rohan M.', vehicle: 'BMW 3 Series', rating: 5, text: 'The real-time tracking is a game changer. I knew exactly when the team would arrive. Super professional.' },
  { name: 'Priya K.', vehicle: 'Audi Q5', rating: 5, text: 'Subscribed to the monthly plan and honestly haven\'t looked back. Consistent, premium quality every single time.' },
  { name: 'Vikram J.', vehicle: 'Range Rover Sport', rating: 5, text: 'Even the tyres and engine bay were spotless. These guys are genuinely detail-obsessed. Highly recommend.' },
];

const PACKAGES = [
  { name: 'Express', price: '₹299', duration: '30 min', tier: 'basic', highlight: false,
    features: ['Exterior foam wash', 'Wheel rinse', 'Glass cleaning', 'Air freshener'] },
  { name: 'Premium', price: '₹599', duration: '60 min', tier: 'premium', highlight: true,
    features: ['Interior vacuum', 'Dashboard wipe', 'Seat cleaning', 'Tyre shine', 'Glass polish'] },
  { name: 'Luxury', price: '₹1,499', duration: '2 hrs', tier: 'luxury', highlight: false,
    features: ['Ceramic coating', 'Engine bay clean', 'Steam interior', 'Leather conditioning', 'Full wax & polish'] },
];

function StarIcon() {
  return <svg width="14" height="14" viewBox="0 0 14 14" fill="var(--accent)"><path d="M7 1l1.8 3.6L13 5.3l-3 2.9.7 4.1L7 10.4l-3.7 1.9.7-4.1-3-2.9 4.2-.7z"/></svg>;
}

export default function LandingPage() {
  const heroRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const onMouse = (e) => {
      setMousePos({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });
    };
    window.addEventListener('mousemove', onMouse);
    return () => window.removeEventListener('mousemove', onMouse);
  }, []);

  // Intersection Observer for scroll reveals
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('revealed'); }),
      { threshold: 0.1 }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <div className="landing">
      <Navbar />

      {/* ── HERO ── */}
      <section className="hero" ref={heroRef}>
        <div className="hero__bg">
          <div className="hero__orb hero__orb--1" style={{ transform: `translate(${mousePos.x * 30}px, ${mousePos.y * 20}px)` }} />
          <div className="hero__orb hero__orb--2" style={{ transform: `translate(${-mousePos.x * 20}px, ${-mousePos.y * 30}px)` }} />
          <div className="hero__grid" />
        </div>

        <div className="container">
          <div className="hero__inner">
            <div className="hero__badge reveal">
              <span className="hero__badge-dot" />
              <span>Available in Chandigarh & Ambala</span>
            </div>

            <h1 className="hero__headline reveal">
              Your car,<br />
              <em>spotless</em><br />
              at your door.
            </h1>

            <p className="hero__sub reveal">
              Premium-grade car washing delivered to your home or office.<br />
              Book in 60 seconds. Track live. No mess, no hassle.
            </p>

            <div className="hero__actions reveal">
              <Link to="/packages" className="btn-accent">
                Book a Wash
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
              </Link>
              <a href="#how-it-works" className="btn-ghost">
                See how it works
              </a>
            </div>

            <div className="hero__stats reveal">
              {STATS.map(s => (
                <div key={s.label} className="hero__stat">
                  <span className="hero__stat-value">{s.value}</span>
                  <span className="hero__stat-label">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="hero__visual reveal">
            <div className="hero__card-stack">
              <div className="hero__card hero__card--back">
                <div className="hero__card-label">Premium Wash</div>
                <div className="hero__card-price">₹599</div>
              </div>
              <div className="hero__card hero__card--main">
                <div className="hero__card-top">
                  <div className="hero__card-avatar">RK</div>
                  <div>
                    <div className="hero__card-name">Rahul Kumar</div>
                    <div className="hero__card-eta">Arriving in 8 mins</div>
                  </div>
                  <div className="hero__card-badge">Live</div>
                </div>
                <div className="hero__card-map">
                  <svg viewBox="0 0 280 140" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="280" height="140" fill="#1C1C1E" rx="12"/>
                    <path d="M20 90 Q60 60 100 75 Q140 90 180 55 Q220 20 260 40" stroke="#2C2C2E" strokeWidth="20" strokeLinecap="round"/>
                    <path d="M20 90 Q60 60 100 75 Q140 90 180 55 Q220 20 260 40" stroke="#3A3A3C" strokeWidth="2" strokeDasharray="6 4" strokeLinecap="round"/>
                    <circle cx="200" cy="48" r="6" fill="#C8F04A"/>
                    <circle cx="200" cy="48" r="12" fill="#C8F04A" opacity="0.2">
                      <animate attributeName="r" values="8;16;8" dur="2s" repeatCount="indefinite"/>
                      <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite"/>
                    </circle>
                    <circle cx="80" cy="78" r="4" fill="#636366"/>
                    <text x="80" y="100" fill="#636366" fontSize="8" textAnchor="middle">Your location</text>
                  </svg>
                </div>
                <div className="hero__card-status">
                  <span className="hero__card-status-dot" />
                  <span>Worker is on the way</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── MARQUEE ── */}
      <div className="marquee-strip">
        <div className="marquee-inner">
          {['Premium Products', 'Doorstep Service', 'Live Tracking', 'Certified Washers', 'Interior + Exterior', 'Tyre Shine', 'Eco-Friendly', 'Premium Products', 'Doorstep Service', 'Live Tracking', 'Certified Washers', 'Interior + Exterior', 'Tyre Shine', 'Eco-Friendly'].map((t, i) => (
            <span key={i} className="marquee-item">{t} <span className="marquee-dot">✦</span></span>
          ))}
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <section className="section" id="how-it-works">
        <div className="container">
          <div className="section__header reveal">
            <span className="section__tag">Process</span>
            <h2 className="section__title">Effortlessly simple,<br />remarkably thorough</h2>
          </div>
          <div className="steps">
           {STEPS.map((s, i) => (
            <div key={s.num} className="step reveal" style={{ animationDelay: `${i * 0.1}s` }}>
             <div className="step__img-wrap">
              <img src={s.img} alt={s.alt} className="step__img" />
              <div className="step__num-badge">{s.num}</div>
            </div>
            <div className="step__content">
              <h3 className="step__title">{s.title}</h3>
              <p className="step__desc">{s.desc}</p>
             </div>
           </div>
         ))}
        </div>
        </div>
      </section>

      {/* ── PACKAGES ── */}
      <section className="section section--dark" id="packages">
        <div className="container">
          <div className="section__header reveal">
            <span className="section__tag">Packages</span>
            <h2 className="section__title" style={{ color: 'var(--white)' }}>Choose your standard</h2>
          </div>
          <div className="packages-grid">
            {PACKAGES.map((pkg, i) => (
              <div key={pkg.name} className={`pkg-card reveal ${pkg.highlight ? 'pkg-card--featured' : ''}`} style={{ animationDelay: `${i * 0.1}s` }}>
                {pkg.highlight && <div className="pkg-card__popular">Most Popular</div>}
                <div className="pkg-card__tier">{pkg.tier}</div>
                <h3 className="pkg-card__name">{pkg.name}</h3>
                <div className="pkg-card__price">
                  <span className="pkg-card__amount">{pkg.price}</span>
                  <span className="pkg-card__duration">{pkg.duration}</span>
                </div>
                <ul className="pkg-card__features">
                  {pkg.features.map(f => (
                    <li key={f}>
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7l3.5 3.5L12 3" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"/></svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/packages" className={`pkg-card__cta ${pkg.highlight ? 'pkg-card__cta--accent' : ''}`}>
                  Book Now
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REVIEWS ── */}
      <section className="section" id="reviews">
        <div className="container">
          <div className="section__header reveal">
            <span className="section__tag">Reviews</span>
            <h2 className="section__title">What our customers say</h2>
          </div>
          <div className="reviews-grid">
            {REVIEWS.map((r, i) => (
              <div key={r.name} className="review-card reveal" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="review-card__stars">
                  {[...Array(r.rating)].map((_, j) => <StarIcon key={j} />)}
                </div>
                <p className="review-card__text">"{r.text}"</p>
                <div className="review-card__author">
                  <div className="review-card__avatar">{r.name.charAt(0)}</div>
                  <div>
                    <div className="review-card__name">{r.name}</div>
                    <div className="review-card__vehicle">{r.vehicle}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-inner reveal">
            <h2 className="cta-title">Your car deserves better.<br />Book a wash today.</h2>
            <p className="cta-sub">First-time customers get 20% off. No code needed.</p>
            <Link to="/packages" className="btn-accent btn-accent--lg">
              Get Started — It's Free
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9h12M10 4l5 5-5 5"/></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="container">
          <div className="footer__inner">
            <div>
              <div className="navbar__logo" style={{ marginBottom: '12px' }}>
                <span className="navbar__logo-mark">D</span>
                <span style={{ color: 'var(--white)', fontFamily: 'var(--font-heading)', fontSize: '18px', fontWeight: 700 }}>DoorWash</span>
              </div>
              <p style={{ color: 'var(--gray-5)', fontSize: '14px', maxWidth: '240px', lineHeight: 1.6 }}>Premium doorstep car washing. We come to you.</p>
            </div>
            <div className="footer__links">
              <div className="footer__col">
                <h4>Services</h4>
                <Link to="/packages">Express Wash</Link>
                <Link to="/packages">Premium Wash</Link>
                <Link to="/packages">Luxury Detail</Link>
                <Link to="/packages">Monthly Club</Link>
              </div>
              <div className="footer__col">
                <h4>Company</h4>
                <a href="#how-it-works">How It Works</a>
                <a href="#reviews">Reviews</a>
                <Link to="/login">Sign In</Link>
                <Link to="/register">Register</Link>
              </div>
            </div>
          </div>
          <div className="footer__bottom">
            <span>© 2025 DoorWash. All rights reserved.</span>
            <span>Made with care in India 🇮🇳</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
