import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'var(--black)' }}>
      <div style={{ textAlign:'center' }}>
        <div className="dw-spinner" />
        <p style={{ color:'var(--gray-5)', marginTop:16, fontSize:14 }}>Loading DoorWash…</p>
      </div>
      <style>{`.dw-spinner{width:40px;height:40px;border:3px solid #333;border-top-color:#C8F04A;border-radius:50%;animation:spin .8s linear infinite;margin:0 auto}@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  if (!user) {
    // Save where they were trying to go so we can redirect after login
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (role && user.role !== role) {
    const redirect = user.role === 'admin' ? '/admin' : user.role === 'worker' ? '/worker' : '/dashboard';
    return <Navigate to={redirect} replace />;
  }

  return children;
}
