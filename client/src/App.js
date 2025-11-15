import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';
import ReportLost from './pages/ReportLost';
import ReportFound from './pages/ReportFound';
import MyReports from './pages/MyReports';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import ProtectedRoute from './components/ProtectedRoute';
import MatchedReports from './pages/MatchedReports';
import Dashboard from './pages/Dashboard';
import TestMatching from './pages/TestMatching';
import DebugAuth from './pages/DebugAuth';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { GoogleOAuthProvider } from '@react-oauth/google';

// We hardcode this for the test, but you should move it back to your .env file
const GOOGLE_CLIENT_ID = "981577476913-3mnajrs4i54uif4vnip6fdpbaa8ecpjg.apps.googleusercontent.com";

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <SocketProvider>
          <Router>
            <div className="min-h-screen bg-gray-100">
              <Navbar />
              <Routes>
                {/* --- CHANGED THIS --- */}
                <Route path="/" element={<Home />} /> {/* Home is now the landing page */}
                <Route path="/home" element={<Home />} /> {/* Home is also here */}
                {/* ------------------- */}
                
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/admin-login" element={<AdminLogin />} />

                {/* --- User Protected Routes --- */}
                <Route path="/report-lost" element={<ProtectedRoute><ReportLost /></ProtectedRoute>} />
                <Route path="/report-found" element={<ProtectedRoute><ReportFound /></ProtectedRoute>} />
                <Route path="/my-reports" element={<ProtectedRoute><MyReports /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="/matched-reports" element={<ProtectedRoute><MatchedReports /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/test-matching" element={<ProtectedRoute><TestMatching /></ProtectedRoute>} />
                <Route path="/debug-auth" element={<ProtectedRoute><DebugAuth /></ProtectedRoute>} />
                
                {/* --- Admin Protected Route --- */}
                {/* You should ideally wrap this in an AdminProtectedRoute */}
                <Route path="/admin-dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />

                {/* Redirect any other path */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
          </Router>
        </SocketProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;