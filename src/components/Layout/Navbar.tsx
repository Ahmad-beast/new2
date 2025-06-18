import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mic, Moon, Sun, User, LogOut, Menu, X, HelpCircle, MessageCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [showMobileMenu, setShowMobileMenu] = React.useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setShowMobileMenu(false);
  };

  const closeMobileMenu = () => {
    setShowMobileMenu(false);
  };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          <Link to="/" className="flex items-center space-x-2" onClick={closeMobileMenu}>
            <div className="bg-blue-600 p-1.5 sm:p-2 rounded-lg">
              <Mic className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
            </div>
            <span className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              AI Voice Generator
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/help"
              className="flex items-center space-x-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <HelpCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Help</span>
            </Link>
            
            <Link
              to="/contact"
              className="flex items-center space-x-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Contact</span>
            </Link>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <Moon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              )}
            </button>

            {user ? (
              <div className="flex items-center space-x-2">
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <User className="h-4 w-4" />
                  <span className="text-sm font-medium">Dashboard</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-red-600 dark:text-red-400"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/pricing"
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                >
                  View Pricing
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              ) : (
                <Moon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
              )}
            </button>
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {showMobileMenu ? (
                <X className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              ) : (
                <Menu className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-gray-200 dark:border-gray-700 py-4">
            <div className="space-y-2">
              <Link
                to="/help"
                onClick={closeMobileMenu}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <HelpCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Help Center</span>
              </Link>
              
              <Link
                to="/contact"
                onClick={closeMobileMenu}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <MessageCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Contact Us</span>
              </Link>

              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    onClick={closeMobileMenu}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <User className="h-4 w-4" />
                    <span className="text-sm font-medium">Dashboard</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-red-600 dark:text-red-400 text-left"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={closeMobileMenu}
                    className="block px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    to="/pricing"
                    onClick={closeMobileMenu}
                    className="block px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors text-center"
                  >
                    View Pricing
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
