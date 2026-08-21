import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SuperAdminLogin from '../pages/auth/SuperAdminLogin';
import SuperAdminLayout from '../components/layout/SuperAdminLayout';
import SuperAdminDashboard from '../pages/super-admin/SuperAdminDashboard';
import Tenants from '../pages/super-admin/Tenants';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/super-admin/login" replace />;
  }
  
  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/super-admin" replace />} />
      <Route path="/super-admin/login" element={<SuperAdminLogin />} />
      
      <Route path="/super-admin" element={
        <ProtectedRoute>
          <SuperAdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<SuperAdminDashboard />} />
        <Route path="tenants" element={<Tenants />} />
        <Route path="settings" element={<div>Settings Component Placeholder</div>} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
