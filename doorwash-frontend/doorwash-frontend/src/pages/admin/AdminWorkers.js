import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';
import './AdminTable.css';

export default function AdminWorkers() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filter === 'approved') params.set('isApproved', 'true');
    if (filter === 'pending') params.set('isApproved', 'false');
    if (filter === 'available') params.set('isAvailable', 'true');
    api.get(`/workers?${params}`).then(r => setWorkers(r.data.workers)).finally(() => setLoading(false));
  }, [filter]);

  const approve = async (id) => {
    await api.put(`/workers/${id}/approve`);
    setWorkers(w => w.map(wk => wk._id === id ? { ...wk, isApproved: true } : wk));
    toast.success('Worker approved!');
  };

  return (
    <DashboardLayout title="Manage Workers">
      <div className="admin-table-page">
        <div className="admin-table-filters">
          {['all', 'approved', 'pending', 'available'].map(f => (
            <button key={f} className={`admin-filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        <div className="admin-table-card">
          {loading ? (
            <div className="admin-table-loading">
              {[...Array(5)].map((_, i) => <div key={i} className="admin-row-skeleton" />)}
            </div>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Worker</th>
                  <th>Phone</th>
                  <th>Rating</th>
                  <th>Total Ratings</th>
                  <th>Status</th>
                  <th>Approved</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {workers.map(w => (
                  <tr key={w._id}>
                    <td>
                      <div className="admin-worker-mini">
                        <div className="admin-worker-mini-av">{w.name?.charAt(0)}</div>
                        <div>
                          <div className="admin-cell-primary">{w.name}</div>
                          <div className="admin-cell-sub">{w.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><div className="admin-cell-primary">{w.phone}</div></td>
                    <td>
                      <div className="admin-rating">
                        <span className="admin-rating-star">★</span>
                        {w.rating?.toFixed(1) || '—'}
                      </div>
                    </td>
                    <td><div className="admin-cell-primary">{w.totalRatings || 0}</div></td>
                    <td>
                      <span className={`admin-status-badge`} style={{
                        color: w.isAvailable ? '#10B981' : '#636366',
                        background: w.isAvailable ? 'rgba(16,185,129,0.1)' : 'rgba(99,99,102,0.1)',
                      }}>
                        {w.isAvailable ? 'Available' : 'Offline'}
                      </span>
                    </td>
                    <td>
                      <span className="admin-status-badge" style={{
                        color: w.isApproved ? '#10B981' : '#F59E0B',
                        background: w.isApproved ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                      }}>
                        {w.isApproved ? 'Approved' : 'Pending'}
                      </span>
                    </td>
                    <td>
                      {!w.isApproved && (
                        <button className="admin-btn-sm admin-btn-accent" onClick={() => approve(w._id)}>
                          Approve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {workers.length === 0 && !loading && (
            <div className="admin-table-empty">No workers found.</div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
