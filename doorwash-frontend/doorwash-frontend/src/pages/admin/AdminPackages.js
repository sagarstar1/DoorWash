import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';
import './AdminTable.css';
import './AdminPackages.css';

const EMPTY_PKG = {
  name: '', description: '', price: '', duration: '',
  vehicleTypes: ['car'], services: '', tier: 'basic',
  isSubscription: false, discountPercent: 0,
};

export default function AdminPackages() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_PKG);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/packages').then(r => setPackages(r.data.packages)).finally(() => setLoading(false));
  }, []);

  const openCreate = () => { setForm(EMPTY_PKG); setEditing(null); setModal(true); };
  const openEdit = (pkg) => {
    setForm({ ...pkg, services: Array.isArray(pkg.services) ? pkg.services.join('\n') : pkg.services });
    setEditing(pkg._id);
    setModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        duration: Number(form.duration),
        services: typeof form.services === 'string' ? form.services.split('\n').map(s => s.trim()).filter(Boolean) : form.services,
      };
      if (editing) {
        const res = await api.put(`/packages/${editing}`, payload);
        setPackages(p => p.map(pk => pk._id === editing ? res.data.package : pk));
        toast.success('Package updated!');
      } else {
        const res = await api.post('/packages', payload);
        setPackages(p => [...p, res.data.package]);
        toast.success('Package created!');
      }
      setModal(false);
    } catch {} finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deactivate this package?')) return;
    await api.delete(`/packages/${id}`);
    setPackages(p => p.map(pk => pk._id === id ? { ...pk, isActive: false } : pk));
    toast.success('Package deactivated');
  };

  const TIER_COLORS = { basic: '#636366', premium: '#C8F04A', luxury: '#FFD700' };

  return (
    <DashboardLayout title="Manage Packages">
      <div className="admin-table-page">
        <div className="admin-table-topbar">
          <span className="admin-table-count">{packages.length} packages</span>
          <button className="admin-btn-primary" onClick={openCreate}>+ New Package</button>
        </div>

        <div className="admin-pkg-grid">
          {loading ? (
            [...Array(4)].map((_, i) => <div key={i} className="admin-pkg-skeleton" />)
          ) : packages.map(pkg => (
            <div key={pkg._id} className={`admin-pkg-card ${!pkg.isActive ? 'admin-pkg-card--inactive' : ''}`}>
              <div className="admin-pkg-card-top">
                <span className="admin-pkg-tier" style={{ color: TIER_COLORS[pkg.tier] }}>{pkg.tier}</span>
                {!pkg.isActive && <span className="admin-pkg-inactive-badge">Inactive</span>}
              </div>
              <h3 className="admin-pkg-name">{pkg.name}</h3>
              <div className="admin-pkg-price">₹{pkg.price?.toLocaleString('en-IN')}</div>
              <p className="admin-pkg-desc">{pkg.description}</p>
              <div className="admin-pkg-tags">
                {pkg.vehicleTypes?.map(v => <span key={v} className="admin-pkg-tag">{v}</span>)}
                {pkg.isSubscription && <span className="admin-pkg-tag admin-pkg-tag--sub">Monthly</span>}
              </div>
              <div className="admin-pkg-actions">
                <button className="admin-btn-sm admin-btn-outline" onClick={() => openEdit(pkg)}>Edit</button>
                {pkg.isActive && <button className="admin-btn-sm admin-btn-danger" onClick={() => handleDelete(pkg._id)}>Deactivate</button>}
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {modal && (
          <div className="admin-modal-overlay" onClick={(e) => e.target === e.currentTarget && setModal(false)}>
            <div className="admin-modal">
              <div className="admin-modal-header">
                <h2>{editing ? 'Edit Package' : 'Create Package'}</h2>
                <button onClick={() => setModal(false)} className="admin-modal-close">✕</button>
              </div>
              <div className="admin-modal-body">
                <div className="admin-modal-field">
                  <label>Package Name</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Premium Wash" />
                </div>
                <div className="admin-modal-field">
                  <label>Description</label>
                  <textarea rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description" />
                </div>
                <div className="admin-modal-row">
                  <div className="admin-modal-field">
                    <label>Price (₹)</label>
                    <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="599" />
                  </div>
                  <div className="admin-modal-field">
                    <label>Duration (min)</label>
                    <input type="number" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} placeholder="60" />
                  </div>
                  <div className="admin-modal-field">
                    <label>Tier</label>
                    <select value={form.tier} onChange={e => setForm(f => ({ ...f, tier: e.target.value }))}>
                      <option value="basic">Basic</option>
                      <option value="premium">Premium</option>
                      <option value="luxury">Luxury</option>
                    </select>
                  </div>
                </div>
                <div className="admin-modal-field">
                  <label>Services (one per line)</label>
                  <textarea rows={4} value={form.services} onChange={e => setForm(f => ({ ...f, services: e.target.value }))} placeholder={"Exterior foam wash\nGlass cleaning\nTyre shine"} />
                </div>
                <div className="admin-modal-row">
                  <div className="admin-modal-field">
                    <label>Discount %</label>
                    <input type="number" min={0} max={100} value={form.discountPercent} onChange={e => setForm(f => ({ ...f, discountPercent: Number(e.target.value) }))} />
                  </div>
                  <div className="admin-modal-field admin-modal-check">
                    <label>
                      <input type="checkbox" checked={form.isSubscription} onChange={e => setForm(f => ({ ...f, isSubscription: e.target.checked }))} />
                      Monthly Subscription
                    </label>
                  </div>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button className="admin-btn-outline-dark" onClick={() => setModal(false)}>Cancel</button>
                <button className="admin-btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : editing ? 'Update Package' : 'Create Package'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
