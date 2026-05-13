import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/common/ProtectedRoute';

// Public pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PackagesPage from './pages/PackagesPage';

// Customer pages
import DashboardPage from './pages/customer/DashboardPage';
import BookingPage from './pages/customer/BookingPage';
import TrackingPage from './pages/customer/TrackingPage';
import BookingHistoryPage from './pages/customer/BookingHistoryPage';
import ProfilePage from './pages/customer/ProfilePage';
import ReviewPage from './pages/customer/ReviewPage';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBookings from './pages/admin/AdminBookings';
import AdminWorkers from './pages/admin/AdminWorkers';
import AdminPackages from './pages/admin/AdminPackages';
import AdminUsers from './pages/admin/AdminUsers';

// Worker pages
import WorkerDashboard from './pages/worker/WorkerDashboard';
import WorkerJobsPage from './pages/worker/WorkerJobsPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <SocketProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                fontFamily: 'var(--font-body)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--black)',
                color: 'var(--white)',
                fontSize: '14px',
                padding: '12px 18px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
              },
              success: {
                iconTheme: { primary: 'var(--accent)', secondary: 'var(--black)' },
              },
              error: {
                iconTheme: { primary: '#EF4444', secondary: 'var(--white)' },
              },
            }}
          />
          <Routes>
            {/* ── Public ── */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/packages" element={<PackagesPage />} />

            {/* ── Customer (Protected) ── */}
            <Route path="/dashboard" element={
              <ProtectedRoute role="customer"><DashboardPage /></ProtectedRoute>
            } />
            <Route path="/book/:packageId" element={
              <ProtectedRoute role="customer"><BookingPage /></ProtectedRoute>
            } />
            <Route path="/track/:bookingId" element={
              <ProtectedRoute role="customer"><TrackingPage /></ProtectedRoute>
            } />
            <Route path="/bookings" element={
              <ProtectedRoute role="customer"><BookingHistoryPage /></ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute role="customer"><ProfilePage /></ProtectedRoute>
            } />
            <Route path="/review/:bookingId" element={
              <ProtectedRoute role="customer"><ReviewPage /></ProtectedRoute>
            } />

            {/* ── Admin (Protected) ── */}
            <Route path="/admin" element={
              <ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>
            } />
            <Route path="/admin/bookings" element={
              <ProtectedRoute role="admin"><AdminBookings /></ProtectedRoute>
            } />
            <Route path="/admin/workers" element={
              <ProtectedRoute role="admin"><AdminWorkers /></ProtectedRoute>
            } />
            <Route path="/admin/packages" element={
              <ProtectedRoute role="admin"><AdminPackages /></ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute role="admin"><AdminUsers /></ProtectedRoute>
            } />

            {/* ── Worker (Protected) ── */}
            <Route path="/worker" element={
              <ProtectedRoute role="worker"><WorkerDashboard /></ProtectedRoute>
            } />
            <Route path="/worker/jobs" element={
              <ProtectedRoute role="worker"><WorkerJobsPage /></ProtectedRoute>
            } />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </SocketProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
