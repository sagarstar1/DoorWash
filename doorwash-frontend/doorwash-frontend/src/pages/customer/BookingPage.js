import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import './BookingPage.css';

const STEPS = [
  { label: 'Package', icon: '📦' },
  { label: 'Vehicle', icon: '🚗' },
  { label: 'Schedule', icon: '📅' },
  { label: 'Payment', icon: '💳' },
];

// Simple date/time inputs — no external library needed
function DateTimeInput({ value, onChange }) {
  const toLocal = (d) => {
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };
  const minDate = toLocal(new Date(Date.now() + 60 * 60 * 1000));
  return (
    <input
      type="datetime-local"
      value={toLocal(value)}
      min={minDate}
      onChange={e => onChange(new Date(e.target.value))}
      className="booking__datetime-input"
    />
  );
}

export default function BookingPage() {
  const { packageId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [step, setStep] = useState(0);
  const [pkg, setPkg] = useState(null);
  const [pkgLoading, setPkgLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [vehicle, setVehicle] = useState({
    type: 'car', brand: '', model: '', plate: '', color: '',
  });
  const [selectedSavedVehicle, setSelectedSavedVehicle] = useState(null);

  const [schedule, setSchedule] = useState({
    scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
    fullAddress: '',
    notes: '',
  });

  const [loyalty, setLoyalty] = useState(0);

  // ── Load package ──
  useEffect(() => {
    api.get(`/packages/${packageId}`)
      .then(r => setPkg(r.data.package))
      .catch(() => { toast.error('Package not found'); navigate('/packages'); })
      .finally(() => setPkgLoading(false));
  }, [packageId, navigate]);

  // ── Helpers ──
  const loadRazorpay = () => new Promise(resolve => {
    if (window.Razorpay) { resolve(true); return; }
    const s = document.createElement('script');
    s.src = 'https://checkout.razorpay.com/v1/checkout.js';
    s.onload = () => resolve(true);
    s.onerror = () => resolve(false);
    document.body.appendChild(s);
  });

  const finalAmount = pkg ? Math.max(0, pkg.price - loyalty) : 0;

  const vehicleData = selectedSavedVehicle
    ? user?.vehicles?.[selectedSavedVehicle - 1]
    : vehicle;

  // ── Step validation ──
  const canGoNext = () => {
    if (step === 1) {
      if (selectedSavedVehicle) return true;
      return vehicle.brand.trim() && vehicle.model.trim();
    }
    if (step === 2) return schedule.fullAddress.trim().length > 5;
    return true;
  };

  // ── Submit booking + payment ──
  const handlePay = async () => {
    setSubmitting(true);
    try {
      // 1 — Create booking
      const bookRes = await api.post('/bookings', {
        packageId,
        vehicle: vehicleData,
        address: {
          fullAddress: schedule.fullAddress,
          lat: 28.6139,
          lng: 77.2090,
        },
        scheduledAt: schedule.scheduledAt,
        notes: schedule.notes,
        loyaltyPointsUse: loyalty,
      });
      const booking = bookRes.data.booking;

      // 2 — Create Razorpay order
      const orderRes = await api.post('/payments/create-order', {
        bookingId: booking._id,
      });
      const { order, key } = orderRes.data;

      // 3 — Load Razorpay script
      const loaded = await loadRazorpay();
      if (!loaded) {
        toast.error('Payment gateway failed to load. Try again.');
        setSubmitting(false);
        return;
      }

      // 4 — Open Razorpay
      const rzp = new window.Razorpay({
        key,
        amount: order.amount,
        currency: 'INR',
        name: 'DoorWash',
        description: pkg.name,
        order_id: order.id,
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
          contact: user?.phone || '',
        },
        notes: { bookingId: booking._id },
        theme: { color: '#C8F04A' },
        handler: async (response) => {
          try {
            await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId: booking._id,
            });
            toast.success('Booking confirmed! Your washer will arrive on time. 🚗✨');
            navigate('/bookings');
          } catch {
            toast.error('Payment verification failed. Contact support.');
          }
        },
        modal: {
          ondismiss: () => {
            toast('Payment cancelled. Your booking slot is held for 10 mins.', { icon: 'ℹ️' });
            setSubmitting(false);
          },
        },
      });
      rzp.open();
    } catch (err) {
      setSubmitting(false);
    }
  };

  // ── Loading state ──
  if (pkgLoading) return (
    <div className="booking-page-loading">
      <div className="booking-page-spinner" />
      <p>Loading package…</p>
    </div>
  );

  if (!pkg) return null;

  const TIER_COLORS = { basic: '#AEAEB2', premium: '#C8F04A', luxury: '#FFD700' };

  return (
    <div className="booking-page">
      {/* ── Top bar ── */}
      <header className="booking-page__header">
        <Link to="/packages" className="booking-page__back">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 4L6 9l5 5"/>
          </svg>
          Back to Services
        </Link>
        <div className="booking-page__brand">
          <span className="booking-page__brand-mark">D</span>
          DoorWash
        </div>
        <div className="booking-page__user">
          <div className="booking-page__user-av">{user?.name?.charAt(0)}</div>
          <span>{user?.name?.split(' ')[0]}</span>
        </div>
      </header>

      {/* ── Step indicator ── */}
      <div className="booking-page__steps">
        <div className="booking-page__steps-inner">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.label}>
              <div
                className={`bp-step ${i === step ? 'bp-step--active' : ''} ${i < step ? 'bp-step--done' : ''} ${i < step ? 'bp-step--clickable' : ''}`}
                onClick={() => i < step && setStep(i)}
              >
                <div className="bp-step__circle">
                  {i < step
                    ? <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 7l3 3L12 3" stroke="var(--black)" strokeWidth="2.2" strokeLinecap="round"/></svg>
                    : <span>{i + 1}</span>
                  }
                </div>
                <span className="bp-step__label">{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`bp-step__line ${i < step ? 'bp-step__line--done' : ''}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="booking-page__body">
        <div className="booking-page__main">

          {/* STEP 0 — Package */}
          {step === 0 && (
            <div className="bp-card">
              <h2 className="bp-card__title">Your Selected Package</h2>
              <div className="bp-pkg">
                <div className="bp-pkg__left">
                  <span className="bp-pkg__tier" style={{ color: TIER_COLORS[pkg.tier] }}>
                    {pkg.tier?.toUpperCase()}
                  </span>
                  <h3 className="bp-pkg__name">{pkg.name}</h3>
                  <p className="bp-pkg__desc">{pkg.description}</p>
                  <div className="bp-pkg__tags">
                    {pkg.vehicleTypes?.map(v => <span key={v} className="bp-tag">{v}</span>)}
                    <span className="bp-tag bp-tag--time">⏱ {pkg.duration} min</span>
                  </div>
                </div>
                <div className="bp-pkg__price">
                  ₹{pkg.price?.toLocaleString('en-IN')}
                </div>
              </div>
              <div className="bp-pkg__divider" />
              <h4 className="bp-pkg__inc-title">What's included</h4>
              <ul className="bp-pkg__services">
                {pkg.services?.map(s => (
                  <li key={s}>
                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                      <path d="M2 7.5l3.5 3.5L13 3" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    {s}
                  </li>
                ))}
              </ul>
              <div className="bp-card__footer">
                <Link to="/packages" className="bp-btn-ghost">Change Package</Link>
                <button className="bp-btn-primary" onClick={() => setStep(1)}>
                  Continue
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
                </button>
              </div>
            </div>
          )}

          {/* STEP 1 — Vehicle */}
          {step === 1 && (
            <div className="bp-card">
              <h2 className="bp-card__title">Vehicle Details</h2>
              <p className="bp-card__sub">Tell us what we'll be washing</p>

              {/* Saved vehicles */}
              {user?.vehicles?.length > 0 && (
                <div className="bp-saved-section">
                  <p className="bp-section-label">Your saved vehicles</p>
                  <div className="bp-saved-list">
                    {user.vehicles.map((v, i) => (
                      <button
                        key={i}
                        className={`bp-saved-vehicle ${selectedSavedVehicle === i + 1 ? 'bp-saved-vehicle--selected' : ''}`}
                        onClick={() => setSelectedSavedVehicle(selectedSavedVehicle === i + 1 ? null : i + 1)}
                      >
                        <div className="bp-saved-vehicle__icon">
                          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M2 11l2-5h12l2 5v4H2v-4z"/>
                            <circle cx="5.5" cy="15.5" r="1.5"/>
                            <circle cx="14.5" cy="15.5" r="1.5"/>
                          </svg>
                        </div>
                        <div className="bp-saved-vehicle__info">
                          <span className="bp-saved-vehicle__name">{v.brand} {v.model}</span>
                          <span className="bp-saved-vehicle__plate">{v.plate} · {v.color}</span>
                        </div>
                        {selectedSavedVehicle === i + 1 && (
                          <svg className="bp-saved-vehicle__check" width="18" height="18" viewBox="0 0 18 18" fill="none">
                            <circle cx="9" cy="9" r="9" fill="var(--accent)"/>
                            <path d="M5 9l3 3 5-5" stroke="var(--black)" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                  <div className="bp-or-divider"><span>or add a different vehicle</span></div>
                </div>
              )}

              {/* Manual entry */}
              {!selectedSavedVehicle && (
                <div className="bp-fields">
                  <div className="bp-field">
                    <label>Vehicle Type</label>
                    <div className="bp-type-buttons">
                      {['car', 'suv', 'bike', 'truck'].map(t => (
                        <button
                          key={t}
                          className={`bp-type-btn ${vehicle.type === t ? 'bp-type-btn--active' : ''}`}
                          onClick={() => setVehicle(v => ({ ...v, type: t }))}
                        >
                          {t === 'car' ? '🚗' : t === 'suv' ? '🚙' : t === 'bike' ? '🏍️' : '🚚'} {t.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="bp-field-row">
                    <div className="bp-field">
                      <label>Brand <span className="bp-required">*</span></label>
                      <input
                        placeholder="e.g. Honda, BMW"
                        value={vehicle.brand}
                        onChange={e => setVehicle(v => ({ ...v, brand: e.target.value }))}
                      />
                    </div>
                    <div className="bp-field">
                      <label>Model <span className="bp-required">*</span></label>
                      <input
                        placeholder="e.g. City, 3 Series"
                        value={vehicle.model}
                        onChange={e => setVehicle(v => ({ ...v, model: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="bp-field-row">
                    <div className="bp-field">
                      <label>Number Plate</label>
                      <input
                        placeholder="HR26AB1234"
                        value={vehicle.plate}
                        onChange={e => setVehicle(v => ({ ...v, plate: e.target.value.toUpperCase() }))}
                        style={{ textTransform: 'uppercase' }}
                      />
                    </div>
                    <div className="bp-field">
                      <label>Color</label>
                      <input
                        placeholder="e.g. Pearl White"
                        value={vehicle.color}
                        onChange={e => setVehicle(v => ({ ...v, color: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="bp-card__footer">
                <button className="bp-btn-ghost" onClick={() => setStep(0)}>Back</button>
                <button
                  className="bp-btn-primary"
                  onClick={() => setStep(2)}
                  disabled={!canGoNext()}
                >
                  Continue
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2 — Schedule */}
          {step === 2 && (
            <div className="bp-card">
              <h2 className="bp-card__title">Schedule Your Wash</h2>
              <p className="bp-card__sub">Pick a time and share your location</p>

              <div className="bp-fields">
                <div className="bp-field">
                  <label>Preferred Date & Time</label>
                  <DateTimeInput
                    value={schedule.scheduledAt}
                    onChange={d => setSchedule(s => ({ ...s, scheduledAt: d }))}
                  />
                  <span className="bp-field-hint">We're available 7 AM – 9 PM daily</span>
                </div>

                <div className="bp-field">
                  <label>Full Address <span className="bp-required">*</span></label>
                  <textarea
                    rows={3}
                    placeholder="House/Flat no., Street, Sector, City, PIN&#10;e.g. House 12, Sector 17, Chandigarh 160017"
                    value={schedule.fullAddress}
                    onChange={e => setSchedule(s => ({ ...s, fullAddress: e.target.value }))}
                  />
                  {schedule.fullAddress.length > 0 && schedule.fullAddress.length < 10 && (
                    <span className="bp-field-error">Please enter a complete address</span>
                  )}
                </div>

                <div className="bp-field">
                  <label>Special Instructions <span className="bp-optional">(optional)</span></label>
                  <textarea
                    rows={2}
                    placeholder="Gate code, parking info, call on arrival, etc."
                    value={schedule.notes}
                    onChange={e => setSchedule(s => ({ ...s, notes: e.target.value }))}
                  />
                </div>

                {/* Availability hours visual */}
                <div className="bp-availability">
                  <div className="bp-availability__header">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="var(--accent)" strokeWidth="1.5">
                      <circle cx="7" cy="7" r="5.5"/>
                      <path d="M7 4v3l2 2"/>
                    </svg>
                    <span>Available time slots today</span>
                  </div>
                  <div className="bp-availability__slots">
                  {['7:00 AM', '9:00 AM', '11:00 AM', '2:00 PM', '4:00 PM', '6:00 PM'].map(t => {
                  const [time, period] = t.split(' ');
                  const [hours, minutes] = time.split(':');
                  let h = parseInt(hours);
                  if (period === 'PM' && h !== 12) h += 12;
                  if (period === 'AM' && h === 12) h = 0;
                  const selected = schedule.scheduledAt.getHours() === h;
                  const slotDate = new Date(schedule.scheduledAt);
                  slotDate.setHours(h, parseInt(minutes), 0, 0);
                  return (
                    <button
                      key={t}
                      className={`bp-slot ${selected ? 'bp-slot--active' : ''}`}
                      onClick={() => setSchedule(s => ({ ...s, scheduledAt: slotDate }))}
                    >
                    {t}
                      </button>
                    );
                  })}
                  </div>
                </div>
              </div>

              <div className="bp-card__footer">
                <button className="bp-btn-ghost" onClick={() => setStep(1)}>Back</button>
                <button
                  className="bp-btn-primary"
                  onClick={() => setStep(3)}
                  disabled={!canGoNext()}
                >
                  Review & Pay
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 — Confirm & Pay */}
          {step === 3 && (
            <div className="bp-card">
              <h2 className="bp-card__title">Review & Confirm</h2>
              <p className="bp-card__sub">Everything look good? Let's get that car sparkling.</p>

              <div className="bp-review-sections">
                {/* Package */}
                <div className="bp-review-section">
                  <div className="bp-review-section__header">
                    <span>Package</span>
                    <button className="bp-review-edit" onClick={() => setStep(0)}>Edit</button>
                  </div>
                  <div className="bp-review-row">
                    <span className="bp-review-label">Service</span>
                    <span className="bp-review-value">{pkg.name}</span>
                  </div>
                  <div className="bp-review-row">
                    <span className="bp-review-label">Duration</span>
                    <span className="bp-review-value">{pkg.duration} minutes</span>
                  </div>
                </div>

                {/* Vehicle */}
                <div className="bp-review-section">
                  <div className="bp-review-section__header">
                    <span>Vehicle</span>
                    <button className="bp-review-edit" onClick={() => setStep(1)}>Edit</button>
                  </div>
                  <div className="bp-review-row">
                    <span className="bp-review-label">Car</span>
                    <span className="bp-review-value">{vehicleData?.brand} {vehicleData?.model}</span>
                  </div>
                  {vehicleData?.plate && (
                    <div className="bp-review-row">
                      <span className="bp-review-label">Plate</span>
                      <span className="bp-review-value bp-plate">{vehicleData.plate}</span>
                    </div>
                  )}
                  {vehicleData?.color && (
                    <div className="bp-review-row">
                      <span className="bp-review-label">Color</span>
                      <span className="bp-review-value">{vehicleData.color}</span>
                    </div>
                  )}
                </div>

                {/* Schedule */}
                <div className="bp-review-section">
                  <div className="bp-review-section__header">
                    <span>Schedule</span>
                    <button className="bp-review-edit" onClick={() => setStep(2)}>Edit</button>
                  </div>
                  <div className="bp-review-row">
                    <span className="bp-review-label">Date & Time</span>
                    <span className="bp-review-value">
                      {schedule.scheduledAt.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                      {' at '}
                      {schedule.scheduledAt.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="bp-review-row">
                    <span className="bp-review-label">Address</span>
                    <span className="bp-review-value">{schedule.fullAddress}</span>
                  </div>
                  {schedule.notes && (
                    <div className="bp-review-row">
                      <span className="bp-review-label">Notes</span>
                      <span className="bp-review-value">{schedule.notes}</span>
                    </div>
                  )}
                </div>

                {/* Pricing */}
                <div className="bp-review-section bp-review-section--pricing">
                  <div className="bp-review-section__header"><span>Pricing</span></div>
                  <div className="bp-review-row">
                    <span className="bp-review-label">Package price</span>
                    <span className="bp-review-value">₹{pkg.price?.toLocaleString('en-IN')}</span>
                  </div>

                  {/* Loyalty points */}
                  {user?.loyaltyPoints > 0 && (
                    <div className="bp-loyalty">
                      <div className="bp-loyalty__header">
                        <div>
                          <span className="bp-loyalty__title">🏆 Use Loyalty Points</span>
                          <span className="bp-loyalty__available">You have {user.loyaltyPoints} pts</span>
                        </div>
                        <div className="bp-loyalty__control">
                          <button onClick={() => setLoyalty(Math.max(0, loyalty - 10))} className="bp-loyalty__btn">−</button>
                          <span className="bp-loyalty__val">{loyalty}</span>
                          <button onClick={() => setLoyalty(Math.min(user.loyaltyPoints, pkg.price - 1, loyalty + 10))} className="bp-loyalty__btn">+</button>
                        </div>
                      </div>
                      {loyalty > 0 && (
                        <div className="bp-review-row bp-loyalty-discount">
                          <span className="bp-review-label">Points discount</span>
                          <span className="bp-review-value" style={{ color: '#10B981' }}>− ₹{loyalty}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="bp-review-row bp-total-row">
                    <span>Total payable</span>
                    <span className="bp-total-amount">₹{finalAmount?.toLocaleString('en-IN')}</span>
                  </div>
                  <p className="bp-earn-note">
                    🏆 You'll earn <strong>10 loyalty points</strong> after this wash
                  </p>
                </div>
              </div>

              {/* Payment button */}
              <div className="bp-pay-section">
                <button
                  className="bp-btn-pay"
                  onClick={handlePay}
                  disabled={submitting}
                >
                  {submitting ? (
                    <><span className="bp-spinner" /> Processing…</>
                  ) : (
                    <>
                      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                        <rect x="1" y="4" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="1.8"/>
                        <path d="M1 8h16" stroke="currentColor" strokeWidth="1.8"/>
                        <path d="M5 12h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                      </svg>
                      Pay ₹{finalAmount?.toLocaleString('en-IN')} via Razorpay
                    </>
                  )}
                </button>
                <p className="bp-pay-note">
                  🔒 Secured by Razorpay · UPI, Cards, Net Banking, Wallets accepted
                </p>
              </div>

              <div className="bp-card__footer bp-card__footer--top">
                <button className="bp-btn-ghost" onClick={() => setStep(2)}>← Back</button>
              </div>
            </div>
          )}
        </div>

        {/* ── Sidebar ── */}
        <aside className="booking-page__aside">
          <div className="bp-aside-card">
            <h3 className="bp-aside-title">Order Summary</h3>
            <div className="bp-aside-pkg">
              <div className="bp-aside-pkg__tier" style={{ color: TIER_COLORS[pkg.tier] }}>
                {pkg.tier?.toUpperCase()}
              </div>
              <div className="bp-aside-pkg__name">{pkg.name}</div>
              <div className="bp-aside-pkg__duration">{pkg.duration} minutes</div>
            </div>
            <div className="bp-aside-rows">
              <div className="bp-aside-row">
                <span>Price</span>
                <span>₹{pkg.price?.toLocaleString('en-IN')}</span>
              </div>
              {loyalty > 0 && (
                <div className="bp-aside-row" style={{ color: '#10B981' }}>
                  <span>Points off</span>
                  <span>− ₹{loyalty}</span>
                </div>
              )}
              <div className="bp-aside-row bp-aside-total">
                <span>Total</span>
                <span>₹{finalAmount?.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Progress */}
            <div className="bp-aside-progress">
              {STEPS.map((s, i) => (
                <div key={s.label} className={`bp-aside-step ${i <= step ? 'bp-aside-step--done' : ''}`}>
                  <div className="bp-aside-step__dot">
                    {i < step ? '✓' : i === step ? '●' : '○'}
                  </div>
                  <span>{s.icon} {s.label}</span>
                </div>
              ))}
            </div>

            <div className="bp-aside-trust">
              <div className="bp-trust-item">
                <span>✅</span> Premium-grade products
              </div>
              <div className="bp-trust-item">
                <span>🔒</span> Secure Razorpay payment
              </div>
              <div className="bp-trust-item">
                <span>🏆</span> 10 loyalty points earned
              </div>
              <div className="bp-trust-item">
                <span>📍</span> Live GPS tracking
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
