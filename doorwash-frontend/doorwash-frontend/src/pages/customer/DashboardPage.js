import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import './DashboardPage.css';

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  confirmed: { label: 'Confirmed', color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
  worker_assigned: { label: 'Worker Assigned', color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
  worker_on_the_way: { label: 'On the Way', color: '#C8F04A', bg: 'rgba(200,240,74,0.1)' },
  in_progress: { label: 'In Progress', color: '#06B6D4', bg: 'rgba(6,182,212,0.1)' },
  completed: { label: 'Completed', color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
  cancelled: { label: 'Cancelled', color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/bookings/my?limit=5').then(r => setBookings(r.data.bookings)).finally(() => setLoading(false));
  }, []);

  const activeBooking = bookings.find(b => !['completed', 'cancelled'].includes(b.status));
  const upcomingCount = bookings.filter(b => b.status === 'confirmed' || b.status === 'worker_assigned').length;

  return (
    <DashboardLayout title="Dashboard">
      <div className="dash">
        {/* Welcome Banner */}
        <div className="dash__welcome">
          <div>
            <h2 className="dash__welcome-title">Good day, {user?.name?.split(' ')[0]} 👋</h2>
            <p className="dash__welcome-sub">Your vehicles are in good hands.</p>
          </div>
          <Link to="/packages" className="dash__book-btn">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 2v12M2 8h12"/></svg>
            Book a Wash
          </Link>
        </div>

        {/* Stats */}
        <div className="dash__stats">
          <div className="dash__stat">
            <span className="dash__stat-val">{user?.loyaltyPoints || 0}</span>
            <span className="dash__stat-label">Loyalty Points</span>
          </div>
          <div className="dash__stat">
            <span className="dash__stat-val">{upcomingCount}</span>
            <span className="dash__stat-label">Upcoming</span>
          </div>
          <div className="dash__stat">
            <span className="dash__stat-val">{bookings.filter(b => b.status === 'completed').length}</span>
            <span className="dash__stat-label">Completed</span>
          </div>
          <div className="dash__stat">
            <span className="dash__stat-val">{user?.vehicles?.length || 0}</span>
            <span className="dash__stat-label">Vehicles</span>
          </div>
        </div>

        {/* Active booking card */}
        {activeBooking && (
          <div className="dash__active">
            <div className="dash__active-header">
              <span className="dash__active-tag">Active Booking</span>
              <span className="dash__active-status" style={{ color: STATUS_CONFIG[activeBooking.status]?.color, background: STATUS_CONFIG[activeBooking.status]?.bg }}>
                {STATUS_CONFIG[activeBooking.status]?.label}
              </span>
            </div>
            <div className="dash__active-body">
              <div>
                <div className="dash__active-pkg">{activeBooking.package?.name}</div>
                <div className="dash__active-time">{format(new Date(activeBooking.scheduledAt), 'EEEE, d MMM • h:mm a')}</div>
              </div>
              {['worker_assigned', 'worker_on_the_way', 'in_progress'].includes(activeBooking.status) && (
                <Link to={`/track/${activeBooking._id}`} className="dash__track-btn">
                  Track Live
                  <span className="dash__track-dot" />
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Recent bookings */}
        <div className="dash__section">
          <div className="dash__section-header">
            <h3 className="dash__section-title">Recent Bookings</h3>
            <Link to="/bookings" className="dash__see-all">See all</Link>
          </div>
          {loading ? (
            <div className="dash__loading">
              {[...Array(3)].map((_, i) => <div key={i} className="dash__skeleton" />)}
            </div>
          ) : bookings.length === 0 ? (
            <div className="dash__empty">
              <div className="dash__empty-icon">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none" stroke="var(--gray-6)" strokeWidth="1.5"><rect x="4" y="4" width="24" height="24" rx="4"/><path d="M10 12h12M10 17h8"/></svg>
              </div>
              <p>No bookings yet. <Link to="/packages">Book your first wash →</Link></p>
            </div>
          ) : (
            <div className="dash__bookings">
              {bookings.map(b => {
                const st = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending;
                return (
                  <div key={b._id} className="dash__booking-row">
                    <div className="dash__booking-pkg">
                      <span className="dash__booking-name">{b.package?.name}</span>
                      <span className="dash__booking-date">{format(new Date(b.scheduledAt), 'd MMM yyyy, h:mm a')}</span>
                    </div>
                    <div className="dash__booking-right">
                      <span className="dash__booking-amount">₹{b.finalAmount}</span>
                      <span className="dash__booking-status" style={{ color: st.color, background: st.bg }}>{st.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Vehicles */}
        {user?.vehicles?.length > 0 && (
          <div className="dash__section">
            <div className="dash__section-header">
              <h3 className="dash__section-title">My Vehicles</h3>
              <Link to="/profile" className="dash__see-all">Manage</Link>
            </div>
            <div className="dash__vehicles">
              {user.vehicles.map((v, i) => (
                <div key={i} className="dash__vehicle">
                  <div className="dash__vehicle-icon">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="var(--accent)" strokeWidth="1.5"><path d="M2 11l2-5h12l2 5v4H2v-4z"/><circle cx="5.5" cy="15.5" r="1.5"/><circle cx="14.5" cy="15.5" r="1.5"/></svg>
                  </div>
                  <div>
                    <div className="dash__vehicle-name">{v.brand} {v.model}</div>
                    <div className="dash__vehicle-plate">{v.plate}</div>
                  </div>
                  <span className="dash__vehicle-type">{v.type}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
