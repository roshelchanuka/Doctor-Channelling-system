import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, requiredRole }) => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');

    // If there is no token, user is not authenticated
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // If a specific role is required, check if it matches
    if (requiredRole && (!role || role.toUpperCase() !== requiredRole.toUpperCase())) {
        // Redirect to their respective dashboards based on role
        if (role && role.toUpperCase() === 'DOCTOR') {
            return <Navigate to="/doctor-dashboard" replace />;
        } else if (role && role.toUpperCase() === 'ADMIN') {
            return <Navigate to="/admin-dashboard" replace />;
        } else {
            return <Navigate to="/dashboard" replace />;
        }
    }

    // User is authorized
    return children;
};

export default ProtectedRoute;
