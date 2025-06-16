import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true, 
  adminOnly = false 
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (adminOnly) {
    const isAdmin = localStorage.getItem('isAdmin');
    const adminLoginTime = localStorage.getItem('adminLoginTime');
    
    // Check if admin session is valid (24 hours)
    if (!isAdmin || !adminLoginTime || (Date.now() - parseInt(adminLoginTime)) > 24 * 60 * 60 * 1000) {
      // Clear expired session
      localStorage.removeItem('isAdmin');
      localStorage.removeItem('adminLoginTime');
      return <Navigate to="/admin-access" replace />;
    }
    
    // Admin session is valid, allow access
    return <>{children}</>;
  }

  if (requireAuth && !user) {
    return <Navigate to="/login" replace />;
  }

  if (!requireAuth && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;