import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import CompleteProfile from '../pages/CompleteProfile';
import DoctorDashboard from '../pages/DoctorDashboard';
import AdminDashboard from '../pages/AdminDashboard';
import LandingPage from '../pages/LandingPage';
import PrivacyPolicy from '../pages/PrivacyPolicy';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      
      {/* Protected Routes */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute requiredRole="PATIENT">
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/doctor-dashboard" 
        element={
          <ProtectedRoute requiredRole="DOCTOR">
            <DoctorDashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin-dashboard" 
        element={
          <ProtectedRoute requiredRole="ADMIN">
            <AdminDashboard />
          </ProtectedRoute>
        } 
      />
      
      {/* Assuming complete-profile is for patients after register */}
      <Route 
        path="/complete-profile" 
        element={
          <ProtectedRoute>
            <CompleteProfile />
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

export default App;
