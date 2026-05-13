import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useSocket } from '../../context/SocketContext';
import api from '../../services/api';
import { format } from 'date-fns';
import './TrackingPage.css';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const workerIcon = L.divIcon({
  className: '',
  html: `<div style="width:16px;height:16px;background:#C8F04A;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const customerIcon = L.divIcon({
  className: '',
  html: `<div style="width:16px;height:16px;background:#EF4444;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => { if (center) map.panTo(center); }, [center, map]);
  return null;
}

const STATUS_STEPS = [
  { key: 'confirmed', label: 'Booking Confirmed' },
  { key: 'worker_assigned', label: 'Worker Assigned' },
  { key: 'worker_on_the_way', label: 'On the Way' },
  { key: 'in_progress', label: 'Washing in Progress' },
  { key: 'completed', label: 'All Done!' },
];

export default function TrackingPage() {
  const { bookingId } = useParams();
  const { joinBooking, leaveBooking, on } = useSocket();
  const [booking, setBooking] = useState(null);
  const [workerLocation, setWorkerLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/bookings/${bookingId}`).then(r => setBooking(r.data.booking)).finally(() => setLoading(false));
    joinBooking(bookingId);
    return () => leaveBooking(bookingId);
  }, [bookingId, joinBooking, leaveBooking]);

  useEffect(() => {
    const off1 = on('worker_location_update', ({ lat, lng }) => setWorkerLocation({ lat, lng }));
    const off2 = on('booking_status_update', ({ status }) => setBooking(b => b ? { ...b, status } : b));
    return () => { off1?.(); off2?.(); };
  }, [on]);

  const currentStepIdx = STATUS_STEPS.findIndex(s => s.key === booking?.status);

  if (loading) return (
    <DashboardLayout title="Live Tracking">
      <div className="tracking-loading"><div className="tracking-spinner" /></div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout title="Live Tracking">
      <div className="tracking">
        {/* Map */}
        <div className="tracking__map-card">
         <div className="tracking__map" style={{ height: '320px', borderRadius: '16px', overflow: 'hidden', position: 'relative' }}>
           <MapContainer
            center={
              workerLocation
               ? [workerLocation.lat, workerLocation.lng]
               : [booking?.address?.lat || 28.6139, booking?.address?.lng || 77.2090]
      }
      zoom={14}
      style={{ height: '100%', width: '100%' }}
      zoomControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap'
      />

      {/* Customer location pin */}
      <Marker
        position={[
          booking?.address?.lat || 28.6139,
          booking?.address?.lng || 77.2090,
        ]}
        icon={customerIcon}
      >
        <Popup>📍 Your Location</Popup>
      </Marker>

      {/* Worker live location pin */}
      {workerLocation && (
        <Marker
          position={[workerLocation.lat, workerLocation.lng]}
          icon={workerIcon}
        >
          <Popup>🚗 {booking?.worker?.name} is here</Popup>
        </Marker>
      )}

      {/* Auto pan map as worker moves */}
      {workerLocation && (
        <MapUpdater center={[workerLocation.lat, workerLocation.lng]} />
      )}
    </MapContainer>

    {/* Live badge overlay */}
    <div className="tracking__map-overlay">
      <div className="tracking__map-live">
        <span className="tracking__live-dot" />
        Live Tracking
      </div>
    </div>
  </div>
</div>

        <div className="tracking__body">
          {/* Status timeline */}
          <div className="tracking__card">
            <h3 className="tracking__card-title">Booking Status</h3>
            <div className="tracking__timeline">
              {STATUS_STEPS.map((s, i) => {
                const done = i < currentStepIdx;
                const active = i === currentStepIdx;
                return (
                  <div key={s.key} className={`tracking__tl-item ${done ? 'done' : ''} ${active ? 'active' : ''}`}>
                    <div className="tracking__tl-dot">
                      {done ? <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l2.5 2.5L10 3" stroke="var(--black)" strokeWidth="1.8" strokeLinecap="round"/></svg> : active ? <span className="tracking__tl-pulse" /> : null}
                    </div>
                    {i < STATUS_STEPS.length - 1 && <div className="tracking__tl-line" />}
                    <span className="tracking__tl-label">{s.label}</span>
                    {active && <span className="tracking__tl-now">Now</span>}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Worker info */}
          {booking?.worker && (
            <div className="tracking__card">
              <h3 className="tracking__card-title">Your Washer</h3>
              <div className="tracking__worker">
                <div className="tracking__worker-avatar">{booking.worker.name?.charAt(0)}</div>
                <div>
                  <div className="tracking__worker-name">{booking.worker.name}</div>
                  <div className="tracking__worker-rating">
                    {'★'.repeat(Math.round(booking.worker.rating || 5))}
                    <span>{booking.worker.rating || '5.0'} rating</span>
                  </div>
                </div>
                <a href={`tel:${booking.worker.phone}`} className="tracking__call-btn">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M3 2h3l1.5 3.5-1.8 1.1C6.7 8.7 7.3 9.3 9.4 10.3l1.1-1.8L14 10v3a1 1 0 01-1 1A11 11 0 012 3a1 1 0 011-1z"/></svg>
                  Call
                </a>
              </div>
            </div>
          )}

          {/* Booking details */}
          <div className="tracking__card">
            <h3 className="tracking__card-title">Booking Details</h3>
            <div className="tracking__details">
              <div className="tracking__detail-row"><span>Package</span><strong>{booking?.package?.name}</strong></div>
              <div className="tracking__detail-row"><span>Scheduled</span><strong>{booking?.scheduledAt ? format(new Date(booking.scheduledAt), 'd MMM, h:mm a') : '—'}</strong></div>
              <div className="tracking__detail-row"><span>Address</span><strong>{booking?.address?.fullAddress}</strong></div>
              <div className="tracking__detail-row"><span>Amount Paid</span><strong>₹{booking?.finalAmount}</strong></div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
