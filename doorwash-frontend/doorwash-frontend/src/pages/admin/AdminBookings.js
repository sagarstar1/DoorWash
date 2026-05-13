import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import './AdminTable.css';

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
  confirmed: { label: 'Confirmed', color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
  worker_assigned: { label: 'Worker Assigned', color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
  worker_on_the_way: { label: 'On the Way', color: '#C8F04A', bg: 'rgba(200,240,74,0.12)' },
  in_progress: { label: 'In Progress', color: '#06B6D4', bg: 'rgba(6,182,212,0.1)' },
  completed: { label: 'Completed', color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
  cancelled: { label: 'Cancelled', color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
};

export default function AdminBookings() {
  const [bookings, setBookings] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [assigning, setAssigning] = useState(null); // bookingId being assigned
  const [selectedWorker, setSelectedWorker] = useState('');
  const LIMIT = 15;

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: LIMIT });
    if (filter !== 'all') params.set('status', filter);
    Promise.all([
      api.get(`/bookings/admin/all?${params}`),
      api.get('/workers?isApproved=true'),
    ]).then(([bRes, wRes]) => {
      setBookings(bRes.data.bookings);
      setTotal(bRes.data.total);
      setWorkers(wRes.data.workers);
    }).finally(() => setLoading(false));
  }, [filter, page]);

  const handleAssign = async (bookingId) => {
    if (!selectedWorker) { toast.error('Select a worker'); return; }
    await api.put(`/bookings/${bookingId}/assign`, { workerId: selectedWorker });
    setBookings(b => b.map(bk => bk._id === bookingId ? { ...bk, status: 'worker_assigned', worker: workers.find(w => w._id === selectedWorker) } : bk));
    setAssigning(null);
    setSelectedWorker('');
    toast.success('Worker assigned!');
  };

  return (
    <DashboardLayout title="Manage Bookings">
      <div className="admin-table-page">
        <div className="admin-table-filters">
          {['all', ...Object.keys(STATUS_CONFIG)].map(f => (
            <button key={f} className={`admin-filter-btn ${filter === f ? 'active' : ''}`}
              onClick={() => { setFilter(f); setPage(1); }}>
              {f === 'all' ? 'All' : STATUS_CONFIG[f]?.label}
            </button>
          ))}
        </div>

        <div className="admin-table-card">
          {loading ? (
            <div className="admin-table-loading">
              {[...Array(6)].map((_, i) => <div key={i} className="admin-row-skeleton" />)}
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Package</th>
                  <th>Scheduled</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Worker</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => {
                  const st = STATUS_CONFIG[b.status] || STATUS_CONFIG.pending;
                  return (
                    <tr key={b._id}>
                      <td>
                        <div className="admin-cell-primary">{b.customer?.name}</div>
                        <div className="admin-cell-sub">{b.customer?.phone}</div>
                      </td>
                      <td><div className="admin-cell-primary">{b.package?.name}</div></td>
                      <td><div className="admin-cell-primary">{b.scheduledAt ? format(new Date(b.scheduledAt), 'd MMM, h:mm a') : '—'}</div></td>
                      <td><div className="admin-cell-primary">₹{b.finalAmount}</div></td>
                      <td>
                        <span className="admin-status-badge" style={{ color: st.color, background: st.bg }}>
                          {st.label}
                        </span>
                      </td>
                      <td>
                        {b.worker ? (
                          <div className="admin-worker-mini">
                            <div className="admin-worker-mini-av">{b.worker.name?.charAt(0)}</div>
                            <span>{b.worker.name}</span>
                          </div>
                        ) : (
                          <span className="admin-cell-sub">Unassigned</span>
                        )}
                      </td>
                      <td>
                        {['pending', 'confirmed'].includes(b.status) && (
                          assigning === b._id ? (
                            <div className="admin-assign-row">
                              <select value={selectedWorker} onChange={e => setSelectedWorker(e.target.value)} className="admin-select">
                                <option value="">Pick worker</option>
                                {workers.filter(w => w.isAvailable).map(w => (
                                  <option key={w._id} value={w._id}>{w.name} ★{w.rating?.toFixed(1)}</option>
                                ))}
                              </select>
                              <button className="admin-btn-sm admin-btn-accent" onClick={() => handleAssign(b._id)}>Assign</button>
                              <button className="admin-btn-sm" onClick={() => setAssigning(null)}>✕</button>
                            </div>
                          ) : (
                            <button className="admin-btn-sm admin-btn-outline" onClick={() => setAssigning(b._id)}>Assign</button>
                          )
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          {bookings.length === 0 && !loading && (
            <div className="admin-table-empty">No bookings found for this filter.</div>
          )}
        </div>

        {total > LIMIT && (
          <div className="admin-pagination">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="admin-page-btn">← Prev</button>
            <span>Page {page} of {Math.ceil(total / LIMIT)}</span>
            <button disabled={page >= Math.ceil(total / LIMIT)} onClick={() => setPage(p => p + 1)} className="admin-page-btn">Next →</button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
