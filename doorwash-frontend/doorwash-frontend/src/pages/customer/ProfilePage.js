import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import toast from 'react-hot-toast';
import './ProfilePage.css';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [saving, setSaving] = useState(false);
  const [addingVehicle, setAddingVehicle] = useState(false);
  const [vehicle, setVehicle] = useState({ type: 'car', brand: '', model: '', plate: '', color: '' });

  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await api.put('/auth/update-profile', { name });
      updateUser(res.data.user);
      toast.success('Profile updated!');
    } catch {} finally { setSaving(false); }
  };

  const addVehicle = async () => {
    if (!vehicle.brand || !vehicle.model) { toast.error('Brand and model required'); return; }
    try {
      const res = await api.post('/auth/vehicle', vehicle);
      updateUser({ vehicles: res.data.vehicles });
      setVehicle({ type: 'car', brand: '', model: '', plate: '', color: '' });
      setAddingVehicle(false);
      toast.success('Vehicle added!');
    } catch {}
  };

  return (
    <DashboardLayout title="Profile">
      <div className="profile">
        <div className="profile__card">
          <div className="profile__avatar">{user?.name?.charAt(0)}</div>
          <div className="profile__info">
            <div className="profile__name">{user?.name}</div>
            <div className="profile__email">{user?.email}</div>
            <div className="profile__loyalty"><span className="profile__loyalty-pts">{user?.loyaltyPoints || 0}</span> loyalty points</div>
          </div>
        </div>

        <div className="profile__section">
          <h3 className="profile__section-title">Personal Info</h3>
          <div className="profile__field">
            <label>Full Name</label>
            <input value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div className="profile__field">
            <label>Email</label>
            <input value={user?.email} disabled />
          </div>
          <div className="profile__field">
            <label>Phone</label>
            <input value={user?.phone} disabled />
          </div>
          <button className="profile__save" onClick={saveProfile} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        <div className="profile__section">
          <div className="profile__section-header">
            <h3 className="profile__section-title">My Vehicles</h3>
            <button className="profile__add-btn" onClick={() => setAddingVehicle(!addingVehicle)}>+ Add Vehicle</button>
          </div>

          {addingVehicle && (
            <div className="profile__add-vehicle">
              <div className="profile__field-row">
                <div className="profile__field">
                  <label>Type</label>
                  <select value={vehicle.type} onChange={e => setVehicle(v => ({ ...v, type: e.target.value }))}>
                    <option value="car">Car</option><option value="suv">SUV</option>
                    <option value="bike">Bike</option><option value="truck">Truck</option>
                  </select>
                </div>
                <div className="profile__field">
                  <label>Color</label>
                  <input placeholder="White" value={vehicle.color} onChange={e => setVehicle(v => ({ ...v, color: e.target.value }))} />
                </div>
              </div>
              <div className="profile__field-row">
                <div className="profile__field">
                  <label>Brand *</label>
                  <input placeholder="Honda" value={vehicle.brand} onChange={e => setVehicle(v => ({ ...v, brand: e.target.value }))} />
                </div>
                <div className="profile__field">
                  <label>Model *</label>
                  <input placeholder="City" value={vehicle.model} onChange={e => setVehicle(v => ({ ...v, model: e.target.value }))} />
                </div>
              </div>
              <div className="profile__field">
                <label>Plate Number</label>
                <input placeholder="HR26AB1234" value={vehicle.plate} onChange={e => setVehicle(v => ({ ...v, plate: e.target.value }))} />
              </div>
              <div className="profile__add-vehicle-btns">
                <button className="profile__cancel-btn" onClick={() => setAddingVehicle(false)}>Cancel</button>
                <button className="profile__save" onClick={addVehicle}>Add Vehicle</button>
              </div>
            </div>
          )}

          {user?.vehicles?.map((v, i) => (
            <div key={i} className="profile__vehicle">
              <div className="profile__vehicle-icon">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="var(--accent)" strokeWidth="1.5"><path d="M2 11l2-5h12l2 5v4H2v-4z"/><circle cx="5.5" cy="15.5" r="1.5"/><circle cx="14.5" cy="15.5" r="1.5"/></svg>
              </div>
              <div>
                <div className="profile__vehicle-name">{v.brand} {v.model}</div>
                <div className="profile__vehicle-meta">{v.plate} · {v.color} · {v.type}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
