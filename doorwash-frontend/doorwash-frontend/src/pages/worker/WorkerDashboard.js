import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import toast from 'react-hot-toast';
import './WorkerDashboard.css';

export default function WorkerDashboard() {
  const [stats, setStats] = useState(null);
  const [available, setAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const { emitLocation } = useSocket();

  useEffect(() => {
    api.get('/workers/stats').then(r => {
      setStats(r.data.stats);
      setAvailable(r.data.stats.isAvailable);
    }).finally(() => setLoading(false));
  }, []);

  const toggleAvail = async () => {
    const res = await api.put('/workers/availability');
    setAvailable(res.data.isAvailable);
    toast.success(res.data.isAvailable ? 'You are now available for jobs' : 'You are now offline');
  };

  const shareLocation = () => {
    if (!navigator.geolocation) { toast.error('Geolocation not supported'); return; }
    navigator.geolocation.watchPosition(pos => {
      emitLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      api.put('/workers/location', { lat: pos.coords.latitude, lng: pos.coords.longitude });
    });
    toast.success('Location sharing enabled');
  };

  return (
    <DashboardLayout title="Worker Dashboard">
      <div className="worker-dash">
        <div className="worker-dash__header">
          <div>
            <h2 className="worker-dash__title">Your Status</h2>
            <p className="worker-dash__sub">{available ? 'You are available for new jobs' : 'You are currently offline'}</p>
          </div>
          <div className="worker-dash__controls">
            <button className="worker-dash__location-btn" onClick={shareLocation}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M7 2a4 4 0 014 4c0 3-4 7-4 7S3 9 3 6a4 4 0 014-4z"/><circle cx="7" cy="6" r="1.5"/></svg>
              Share Location
            </button>
            <button className={`worker-dash__toggle ${available ? 'active' : ''}`} onClick={toggleAvail}>
              <span className="worker-dash__toggle-dot" />
              {available ? 'Available' : 'Offline'}
            </button>
          </div>
        </div>

        {!loading && stats && (
          <div className="worker-stats">
            {[
              { label: "Today's Jobs", value: stats.todayCompleted },
              { label: 'Total Jobs', value: stats.totalCompleted },
              { label: 'Total Earnings', value: `₹${(stats.totalEarnings || 0).toLocaleString('en-IN')}` },
              { label: 'Rating', value: stats.rating?.toFixed(1) || '—' },
            ].map(s => (
              <div key={s.label} className="worker-stat">
                <span className="worker-stat__label">{s.label}</span>
                <span className="worker-stat__val">{s.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
