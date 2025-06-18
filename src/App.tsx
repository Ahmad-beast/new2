import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Welcome from './pages/Welcome';
import Pricing from './pages/Pricing';
import Login from './pages/Login';
import AdminAccess from './pages/AdminAccess';
import AdminDashboard from './pages/AdminDashboard';
import Dashboard from './pages/Dashboard';
import HelpCenter from './pages/HelpCenter';
import Contact from './pages/Contact';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
            <Navbar />
            <main>
              <Routes>
                <Route path="/" element={<Welcome />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/help" element={<HelpCenter />} />
                <Route path="/contact" element={<Contact />} />
                <Route 
                  path="/login" 
                  element={
                    <ProtectedRoute requireAuth={false}>
                      <Login />
                    </ProtectedRoute>
                  } 
                />
                <Route path="/admin-access" element={<AdminAccess />} />
                <Route 
                  path="/admin-dashboard" 
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </main>
            <Footer />
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'var(--toast-bg)',
                  color: 'var(--toast-color)',
                },
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
