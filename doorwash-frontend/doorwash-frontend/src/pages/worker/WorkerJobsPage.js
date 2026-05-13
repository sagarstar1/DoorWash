import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { useSocket } from '../../context/SocketContext';

const STATUS_FLOW = { worker_assigned: 'worker_on_the_way', worker_on_the_way: 'in_progress', in_progress: 'completed' };
const STATUS_LABELS = { worker_assigned: 'Start Journey', worker_on_the_way: 'Start Washing', in_progress: 'Mark Complete' };

export default function WorkerJobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const { emitLocation } = useSocket();

  useEffect(() => {
    api.get('/bookings/worker/assigned').then(r => setJobs(r.data.bookings)).finally(() => setLoading(false));
  }, []);

  const updateStatus = async (jobId, currentStatus) => {
    const next = STATUS_FLOW[currentStatus];
    if (!next) return;
    await api.put(`/bookings/${jobId}/status`, { status: next });
    setJobs(j => j.map(job => job._id === jobId ? { ...job, status: next } : job));
    toast.success(`Status updated to ${next.replace(/_/g, ' ')}`);
    if (next === 'worker_on_the_way' && navigator.geolocation) {
      navigator.geolocation.watchPosition(pos => {
        emitLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude, bookingId: jobId });
        api.put('/workers/location', { lat: pos.coords.latitude, lng: pos.coords.longitude, bookingId: jobId });
      });
    }
  };

  return (
    <DashboardLayout title="My Jobs">
      <div style={{ maxWidth: 760, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {loading ? <div>Loading...</div> : jobs.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--gray-5)', background: 'var(--white)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-7)' }}>
            No jobs assigned yet. Make sure you are set to Available.
          </div>
        ) : jobs.map(job => (
          <div key={job._id} style={{ background: 'var(--white)', border: '1px solid var(--gray-7)', borderRadius: 'var(--radius-lg)', padding: '22px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14, gap: 12 }}>
              <div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: 17, fontWeight: 600, color: 'var(--black)', marginBottom: 4 }}>{job.package?.name}</div>
                <div style={{ fontSize: 13, color: 'var(--gray-5)' }}>{job.scheduledAt ? format(new Date(job.scheduledAt), 'EEE, d MMM • h:mm a') : ''}</div>
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 999, background: 'rgba(200,240,74,0.12)', color: '#6b8a00' }}>{job.status?.replace(/_/g, ' ')}</span>
            </div>
            <div style={{ fontSize: 13, color: 'var(--gray-4)', marginBottom: 8 }}>
              <strong style={{ color: 'var(--black)' }}>Customer:</strong> {job.customer?.name} · {job.customer?.phone}
            </div>
            <div style={{ fontSize: 13, color: 'var(--gray-4)', marginBottom: 16 }}>
              <strong style={{ color: 'var(--black)' }}>Address:</strong> {job.address?.fullAddress}
            </div>
            {STATUS_FLOW[job.status] && (
              <button onClick={() => updateStatus(job._id, job.status)}
                style={{ background: 'var(--black)', color: 'var(--white)', border: 'none', borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-body)', fontSize: 14, fontWeight: 600, padding: '11px 24px', cursor: 'pointer', transition: 'all 0.28s' }}>
                {STATUS_LABELS[job.status]}
              </button>
            )}
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
