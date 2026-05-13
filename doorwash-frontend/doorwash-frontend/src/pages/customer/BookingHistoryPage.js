import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import { format } from 'date-fns';
import './BookingHistoryPage.css';

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  confirmed: { label: 'Confirmed', color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
  worker_assigned: { label: 'Worker Assigned', color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
  worker_on_the_way: { label: 'On the Way', color: '#C8F04A', bg: 'rgba(200,240,74,0.1)' },
  in_progress: { label: 'In Progress', color: '#06B6D4', bg: 'rgba(6,182,212,0.1)' },
  completed: { label: 'Completed', color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
  cancelled: { label: 'Cancelled', color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
};

export default function BookingHistoryPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 10;

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: LIMIT });
    if (filter !== 'all') params.set('status', filter);
    api.get(`/bookings/my?${params}`).then(r => {
      setBookings(r.data.bookings);
      setTotal(r.data.total);
    }).finally(() => setLoading(false));
  }, [filter, page]);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    await api.put(`/bookings/${id}/cancel`);
    setBookings(b => b.map(bk => bk._id === id ? { ...bk, status: 'cancelled' } : bk));
  };

  return (
    <DashboardLayout title="My Bookings">
      <div className="history">
        <div className="history__filters">
          {['all', 'pending', 'confirmed', 'in_progress', 'completed', 'cancelled'].map(f => (
            <button key={f} className={`history__filter ${filter === f ? 'active' : ''}`} onClick={() => { setFilter(f); setPage(1); }}>
              {f === 'all' ? 'All' : STATUS_CONFIG[f]?.label || f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="history__loading">
            {[...Array(4)].map((_, i) => <div key={i} className="history__skeleton" />)}
          </div>
        ) : bookings.length === 0 ? (
          <div className="history__empty">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="var(--gray-6)" strokeWidth="1.5"><rect x="8" y="8" width="32" height="32" rx="6"/><path d="M16 18h16M16 24h12M16 30h8"/></svg>
            <p>No bookings found.</p>
            <Link to="/packages">Book your first wash →</Link>
          </div>
        ) : (
          <div className="history__list">
            {bookings.map(b => {
              const st = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending;
              const canTrack = ['worker_assigned', 'worker_on_the_way', 'in_progress'].includes(b.status);
              const canCancel = ['pending', 'confirmed'].includes(b.status);
              const canReview = b.status === 'completed' && !b.review;
              return (
                <div key={b._id} className="history__item">
                  <div className="history__item-header">
                    <div>
                      <div className="history__pkg-name">{b.package?.name}</div>
                      <div className="history__date">{format(new Date(b.scheduledAt), 'EEEE, d MMMM yyyy • h:mm a')}</div>
                    </div>
                    <span className="history__status" style={{ color: st.color, background: st.bg }}>{st.label}</span>
                  </div>

                  <div className="history__item-body">
                    <div className="history__meta">
                      <span>
                        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 11l2-4h8l2 4v2H2v-2z"/><circle cx="4.5" cy="12.5" r="1"/><circle cx="9.5" cy="12.5" r="1"/></svg>
                        {b.vehicle?.brand} {b.vehicle?.model}
                      </span>
                      <span>
                        <svg width="13" height="13" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M7 2a4 4 0 014 4c0 3-4 7-4 7S3 9 3 6a4 4 0 014-4z"/><circle cx="7" cy="6" r="1.5"/></svg>
                        {b.address?.fullAddress?.substring(0, 40)}…
                      </span>
                    </div>
                    <div className="history__amount">₹{b.finalAmount}</div>
                  </div>

                  {(canTrack || canCancel || canReview) && (
                    <div className="history__actions">
                      {canTrack && <Link to={`/track/${b._id}`} className="history__action history__action--track">Track Live</Link>}
                      {canReview && <Link to={`/review/${b._id}`} className="history__action history__action--review">Write Review</Link>}
                      {canCancel && <button onClick={() => handleCancel(b._id)} className="history__action history__action--cancel">Cancel</button>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {total > LIMIT && (
          <div className="history__pagination">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="history__page-btn">← Prev</button>
            <span>Page {page} of {Math.ceil(total / LIMIT)}</span>
            <button disabled={page >= Math.ceil(total / LIMIT)} onClick={() => setPage(p => p + 1)} className="history__page-btn">Next →</button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
