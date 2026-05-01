import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { hasPermission } from '../utils/permissionUtils';

const ProtectedRoute = ({ permission }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Permission check
  if (permission && !hasPermission(permission)) {
    return <Navigate to="/access-denied" replace />;
  }

  return <Outlet />; // Will render the nested components
};

export default ProtectedRoute;
