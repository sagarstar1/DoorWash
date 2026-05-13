import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../../services/api';
import './AdminDashboard.css';

const PIE_COLORS = { completed: '#C8F04A', in_progress: '#3B82F6', confirmed: '#8B5CF6', pending: '#F59E0B', cancelled: '#EF4444', worker_assigned: '#06B6D4', worker_on_the_way: '#10B981' };

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/analytics').then(r => setData(r.data.analytics)).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <DashboardLayout title="Admin Dashboard">
      <div className="admin-loading">
        {[...Array(6)].map((_, i) => <div key={i} className="admin-skeleton" />)}
      </div>
    </DashboardLayout>
  );

  const { users, bookings, revenue, charts, topWorkers } = data || {};

  const STATS = [
    { label: 'Total Customers', value: users?.customers || 0, trend: '+12%' },
    { label: 'Active Workers', value: users?.workers || 0, trend: '+3%' },
    { label: "Today's Revenue", value: `₹${(revenue?.today || 0).toLocaleString('en-IN')}`, trend: '+8%' },
    { label: 'Month Revenue', value: `₹${(revenue?.month || 0).toLocaleString('en-IN')}`, trend: '+22%' },
    { label: 'Total Bookings', value: bookings?.total || 0, trend: '' },
    { label: 'Pending Queue', value: bookings?.pending || 0, alert: (bookings?.pending || 0) > 5 },
  ];

  const revenueData = (charts?.revenueByDay || []).map(d => ({ date: d._id.slice(5), revenue: d.revenue, count: d.count }));
  const pieData = (charts?.bookingsByStatus || []).map(d => ({ name: d._id, value: d.count }));

  return (
    <DashboardLayout title="Admin Dashboard">
      <div className="admin-dash">
        {/* Stats */}
        <div className="admin-stats">
          {STATS.map(s => (
            <div key={s.label} className={`admin-stat ${s.alert ? 'admin-stat--alert' : ''}`}>
              <span className="admin-stat__label">{s.label}</span>
              <span className="admin-stat__val">{s.value}</span>
              {s.trend && <span className="admin-stat__trend">{s.trend}</span>}
              {s.alert && <span className="admin-stat__alert-badge">Needs Attention</span>}
            </div>
          ))}
        </div>

        {/* Charts */}
        <div className="admin-charts">
          <div className="admin-chart-card">
            <h3 className="admin-chart-title">Revenue — Last 30 Days</h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#C8F04A" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#C8F04A" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#636366' }} axisLine={false} tickLine={false}/>
                <YAxis tick={{ fontSize: 11, fill: '#636366' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`}/>
                <Tooltip formatter={v => [`₹${v}`, 'Revenue']} contentStyle={{ background: '#1C1C1E', border: 'none', borderRadius: 8, fontSize: 12 }} labelStyle={{ color: '#AEAEB2' }} itemStyle={{ color: '#C8F04A' }}/>
                <Area type="monotone" dataKey="revenue" stroke="#C8F04A" strokeWidth={2} fill="url(#revenueGrad)"/>
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="admin-chart-card">
            <h3 className="admin-chart-title">Bookings by Status</h3>
            <div className="admin-pie-wrap">
              <PieChart width={180} height={180}>
                <Pie data={pieData} cx={80} cy={80} innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                  {pieData.map((entry, i) => <Cell key={i} fill={PIE_COLORS[entry.name] || '#636366'}/>)}
                </Pie>
              </PieChart>
              <div className="admin-pie-legend">
                {pieData.map(d => (
                  <div key={d.name} className="admin-pie-item">
                    <span className="admin-pie-dot" style={{ background: PIE_COLORS[d.name] || '#636366' }} />
                    <span>{d.name?.replace(/_/g, ' ')}</span>
                    <span className="admin-pie-count">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Quick links */}
        <div className="admin-quick-links">
          {[
            { to: '/admin/bookings', label: 'Manage Bookings', count: bookings?.pending, badge: 'pending' },
            { to: '/admin/workers', label: 'Manage Workers', count: users?.workers },
            { to: '/admin/packages', label: 'Manage Packages', count: null },
            { to: '/admin/users', label: 'All Users', count: users?.customers },
          ].map(l => (
            <Link key={l.to} to={l.to} className="admin-ql">
              <span className="admin-ql__label">{l.label}</span>
              {l.count != null && <span className={`admin-ql__count ${l.badge ? 'admin-ql__count--alert' : ''}`}>{l.count}</span>}
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M3 8h10M9 4l4 4-4 4"/></svg>
            </Link>
          ))}
        </div>

        {/* Top workers */}
        {topWorkers?.length > 0 && (
          <div className="admin-card">
            <h3 className="admin-card-title">Top Rated Workers</h3>
            <div className="admin-workers-list">
              {topWorkers.map((w, i) => (
                <div key={w._id} className="admin-worker-row">
                  <span className="admin-worker-rank">#{i + 1}</span>
                  <div className="admin-worker-avatar">{w.name?.charAt(0)}</div>
                  <div>
                    <div className="admin-worker-name">{w.name}</div>
                    <div className="admin-worker-meta">{w.totalRatings} reviews</div>
                  </div>
                  <div className="admin-worker-rating">
                    <span>★</span> {w.rating?.toFixed(1)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
