import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminAccess: React.FC = () => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Fixed admin password - exactly as requested
    const adminPassword = 'Monopoly1.@';

    setTimeout(() => {
      if (password === adminPassword) {
        // Set admin session with 24-hour expiry
        localStorage.setItem('isAdmin', 'true');
        localStorage.setItem('adminLoginTime', Date.now().toString());
        toast.success('Admin access granted!');
        navigate('/admin-dashboard');
      } else {
        toast.error('Invalid admin password. Please try again.');
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto w-20 h-20 bg-gradient-to-r from-red-500 to-orange-500 rounded-full flex items-center justify-center mb-6 shadow-lg">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Access
          </h2>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Enter the admin password to access the dashboard
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
          <form onSubmit={handleAdminLogin} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Admin Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-700 dark:text-white transition-colors"
                  placeholder="Enter admin password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !password.trim()}
              className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-red-700 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Verifying Access...
                </>
              ) : (
                <>
                  <Shield className="h-5 w-5 mr-2" />
                  Access Admin Panel
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Only authorized personnel can access the admin dashboard
            </p>
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900 rounded-lg border border-yellow-200 dark:border-yellow-700">
              <div className="flex items-center justify-center mb-2">
                <Lock className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mr-2" />
                <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                  Demo Access
                </span>
              </div>
              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                <strong>Password:</strong> 
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAccess;
