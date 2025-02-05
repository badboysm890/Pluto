import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, User, LogOut } from 'lucide-react';
import { authService } from '../lib/auth';

const Navbar = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showLogoutPrompt, setShowLogoutPrompt] = useState(false);
  const logoutRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Get initial session using cached auth
    authService.getUser().then(({ data: { user } }) => {
      setUser(user ?? null);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = authService.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      
      // Redirect to login if logged out
      if (!session) {
        navigate('/');
      }
    });

    // Add click outside listener
    const handleClickOutside = (event: MouseEvent) => {
      if (
        logoutRef.current &&
        !logoutRef.current.contains(event.target as Node) &&
        !profileButtonRef.current?.contains(event.target as Node)
      ) {
        setShowLogoutPrompt(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      subscription.unsubscribe();
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [navigate]);

  const handleProfileClick = () => {
    if (!user) {
      navigate('/login');
    } else {
      setShowLogoutPrompt(!showLogoutPrompt);
    }
  };

  const handleLogout = async () => {
    try {
      // Clear any local storage data
      localStorage.clear();
      
      // Sign out using auth service
      await authService.signOut();
      
      // Close the logout prompt
      setShowLogoutPrompt(false);
      
      // Navigate to home page
      navigate('/');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <nav className="fixed top-0 w-full backdrop-blur-md bg-black/30 border-b border-gray-800 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <span className="text-white text-xl font-bold">Pluto</span>
          </div>
          
          <div className="flex-1 max-w-xl mx-8">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-lg bg-gray-900/50 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Search AI apps..."
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              ref={profileButtonRef}
              onClick={handleProfileClick}
              className="p-2 rounded-lg hover:bg-gray-800 text-gray-300 relative"
            >
              {user ? (
                <User className="h-5 w-5 text-purple-400" />
              ) : (
                <User className="h-5 w-5" />
              )}
            </button>

            {/* Logout Prompt Modal */}
            {showLogoutPrompt && (
              <div
                ref={logoutRef}
                className="absolute top-16 right-4 mt-2 w-48 rounded-md shadow-lg bg-gray-900 ring-1 ring-black ring-opacity-5 backdrop-blur-lg bg-opacity-90"
              >
                <div className="py-1">
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 flex items-center space-x-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Log out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;