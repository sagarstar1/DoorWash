import React, { useEffect, useState, useCallback } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import './AdminTable.css';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('all');
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 15;

  const fetchUsers = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: LIMIT });
    if (role !== 'all') params.set('role', role);
    if (search) params.set('search', search);
    api.get(`/admin/users?${params}`).then(r => {
      setUsers(r.data.users);
      setTotal(r.data.total);
    }).finally(() => setLoading(false));
  }, [page, role, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSearch = (e) => { e.preventDefault(); setSearch(searchInput); setPage(1); };

  const toggleVerify = async (id, current) => {
    await api.put(`/admin/users/${id}`, { isVerified: !current });
    setUsers(u => u.map(usr => usr._id === id ? { ...usr, isVerified: !current } : usr));
    toast.success(!current ? 'User verified' : 'User unverified');
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user permanently?')) return;
    await api.delete(`/admin/users/${id}`);
    setUsers(u => u.filter(usr => usr._id !== id));
    setTotal(t => t - 1);
    toast.success('User deleted');
  };

  const ROLE_COLORS = {
    customer: { color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
    worker: { color: '#8B5CF6', bg: 'rgba(139,92,246,0.1)' },
    admin: { color: '#C8F04A', bg: 'rgba(200,240,74,0.12)' },
  };

  return (
    <DashboardLayout title="All Users">
      <div className="admin-table-page">
        <div className="admin-table-topbar">
          <div className="admin-table-filters" style={{ marginBottom: 0 }}>
            {['all', 'customer', 'worker', 'admin'].map(r => (
              <button key={r} className={`admin-filter-btn ${role === r ? 'active' : ''}`}
                onClick={() => { setRole(r); setPage(1); }}>
                {r.charAt(0).toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>
          <form onSubmit={handleSearch} className="admin-search-form">
            <input
              placeholder="Search name, email, phone..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              className="admin-search-input"
            />
            <button type="submit" className="admin-btn-sm admin-btn-outline">Search</button>
          </form>
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
                  <th>User</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Verified</th>
                  <th>Loyalty Pts</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => {
                  const rc = ROLE_COLORS[u.role] || ROLE_COLORS.customer;
                  return (
                    <tr key={u._id}>
                      <td>
                        <div className="admin-worker-mini">
                          <div className="admin-worker-mini-av" style={{ background: rc.bg, color: rc.color }}>
                            {u.name?.charAt(0)}
                          </div>
                          <div>
                            <div className="admin-cell-primary">{u.name}</div>
                            <div className="admin-cell-sub">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td><div className="admin-cell-primary">{u.phone}</div></td>
                      <td>
                        <span className="admin-status-badge" style={{ color: rc.color, background: rc.bg }}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <div className="admin-cell-primary">
                          {u.createdAt ? format(new Date(u.createdAt), 'd MMM yyyy') : '—'}
                        </div>
                      </td>
                      <td>
                        <span className="admin-status-badge" style={{
                          color: u.isVerified ? '#10B981' : '#F59E0B',
                          background: u.isVerified ? 'rgba(16,185,129,0.1)' : 'rgba(245,158,11,0.1)',
                        }}>
                          {u.isVerified ? 'Verified' : 'Unverified'}
                        </span>
                      </td>
                      <td><div className="admin-cell-primary">{u.loyaltyPoints || 0}</div></td>
                      <td>
                        <div className="admin-action-btns">
                          <button className="admin-btn-sm admin-btn-outline"
                            onClick={() => toggleVerify(u._id, u.isVerified)}>
                            {u.isVerified ? 'Unverify' : 'Verify'}
                          </button>
                          {u.role !== 'admin' && (
                            <button className="admin-btn-sm admin-btn-danger"
                              onClick={() => deleteUser(u._id)}>Delete</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          {users.length === 0 && !loading && (
            <div className="admin-table-empty">No users found.</div>
          )}
        </div>

        {total > LIMIT && (
          <div className="admin-pagination">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="admin-page-btn">← Prev</button>
            <span className="admin-page-info">Page {page} of {Math.ceil(total / LIMIT)} • {total} total</span>
            <button disabled={page >= Math.ceil(total / LIMIT)} onClick={() => setPage(p => p + 1)} className="admin-page-btn">Next →</button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
