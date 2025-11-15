import React, { useState, useRef, useEffect } from 'react';
import { NavLink as RouterLink, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationBell from './NotificationBell';
import { UserCircleIcon } from '@heroicons/react/24/solid';

// Custom NavLink component for desktop navigation
const NavLink = ({ children, to, ...props }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <RouterLink
      to={to}
      className={`px-3 py-2 rounded-md text-sm font-medium ${
        isActive
          ? 'text-blue-700 bg-blue-50'
          : 'text-gray-600 hover:text-blue-700 hover:bg-blue-50'
      } transition-colors duration-200`}
      {...props}
    >
      {children}
    </RouterLink>
  );
};

// Custom MobileNavLink component for mobile navigation
const MobileNavLink = ({ children, to, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <RouterLink
      to={to}
      onClick={onClick}
      className={`block px-3 py-2 rounded-md text-base font-medium ${
        isActive
          ? 'bg-blue-50 text-blue-700'
          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      {children}
    </RouterLink>
  );
};

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, logout } = useAuth(); // 'user' will be null when logged out
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Get user initials for avatar
  const getUserInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // --- RENDER AVATAR (IMAGE OR INITIALS) ---
  const renderAvatar = (isMobile = false) => {
    const sizeClass = isMobile ? 'h-10 w-10' : 'h-9 w-9';
    
    // Check if user and profileImageUrl exist
    if (user && user.profileImageUrl) {
      return (
        <img
          className={`${sizeClass} rounded-full object-cover`}
          src={`http://localhost:5000/${user.profileImageUrl.replace(/\\/g, '/')}`}
          alt="Profile"
        />
      );
    }
    
    // Fallback to initials or a generic icon
    return (
      <div className={`${sizeClass} rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm`}>
        {user?.name ? getUserInitials(user.name) : <UserCircleIcon className="h-6 w-6" />}
      </div>
    );
  };

  // --- THIS IS THE UPDATED LOGIC ---
  // The navbar will now render on ALL pages.
  // The 'user' object (null or not-null) will decide what links to show.
  // --- END OF FIX ---

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-md sticky top-0 z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to={user && user.isAdmin ? "/admin-dashboard" : "/home"} className="flex items-center">
              <img
                src={process.env.PUBLIC_URL + '/kkwlogo.png'}
                alt="KKW Logo"
                className="h-10 w-10 sm:h-12 sm:w-12 object-contain rounded-full shadow-sm border-2 border-blue-100 bg-white mr-3"
              />
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Lost & Found
              </span>
            </Link>
          </div>

          {/* --- UPDATED NAVIGATION LINKS (DESKTOP) --- */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-1">
              {user ? (
                // --- LOGGED-IN LINKS ---
                user.isAdmin ? (
                  <>
                    <NavLink to="/admin-dashboard">Admin Dashboard</NavLink>
                  </>
                ) : (
                  <>
                    <NavLink to="/home">Home</NavLink>
                    <NavLink to="/report-lost">Report Lost</NavLink>
                    <NavLink to="/report-found">Report Found</NavLink>
                    <NavLink to="/my-reports">My Reports</NavLink>
                    <NavLink to="/matched-reports">Matched Reports</NavLink>
                  </>
                )
              ) : (
                // --- LOGGED-OUT LINKS (Public Landing Page) ---
                <>
                  <NavLink to="/home">Home</NavLink>
                  {/* You can add an "About" page here if you want */}
                </>
              )}
            </div>
          </div>
          {/* --- END OF UPDATED LINKS --- */}


          {/* Right side - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              // --- LOGGED-IN USER MENU ---
              <>
                <NotificationBell />
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center space-x-2 focus:outline-none"
                    aria-label="User menu"
                  >
                    {renderAvatar(false)}
                    <span className="text-gray-700 font-medium">{user.name}</span>
                    <svg className={`h-5 w-5 text-gray-500 transition-transform duration-200 ${dropdownOpen ? 'transform rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {dropdownOpen && (
                    <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                      <div className="py-1" role="menu" aria-orientation="vertical">
                        <div className="px-4 py-2 border-b border-gray-100">
                          <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                        {!user.isAdmin && (
                          <Link
                            to="/profile"
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            role="menuitem"
                            onClick={() => setDropdownOpen(false)}
                          >
                            <UserCircleIcon className="h-5 w-5 mr-2 text-gray-400" />
                            Your Profile
                          </Link>
                        )}
                        <Link
                          to="/settings"
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          role="menuitem"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <svg className="h-5 w-5 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          Settings
                        </Link>
                        <div className="border-t border-gray-100"></div>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          role="menuitem"
                        >
                          <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              // --- LOGGED-OUT BUTTONS (WITH REGISTER ADDED) ---
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-md text-sm font-medium text-gray-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-md text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100"
                >
                  Register
                </Link>
                <Link
                  to="/admin-login"
                  className="text-purple-600 hover:text-purple-700 font-medium text-sm ml-4"
                >
                  Admin Login
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            {user && <NotificationBell />}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
              aria-expanded="false"
            >
              {menuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* --- UPDATED MOBILE MENU --- */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          {user ? (
            // --- LOGGED-IN MOBILE MENU ---
            <>
              <div className="pt-2 pb-3 space-y-1">
                {user.isAdmin ? (
                  <MobileNavLink to="/admin-dashboard" onClick={() => setMenuOpen(false)}>Admin Dashboard</MobileNavLink>
                ) : (
                  <>
                    <MobileNavLink to="/home" onClick={() => setMenuOpen(false)}>Home</MobileNavLink>
                    <MobileNavLink to="/report-lost" onClick={() => setMenuOpen(false)}>Report Lost</MobileNavLink>
                    <MobileNavLink to="/report-found" onClick={() => setMenuOpen(false)}>Report Found</MobileNavLink>
                    <MobileNavLink to="/my-reports" onClick={() => setMenuOpen(false)}>My Reports</MobileNavLink>
                    <MobileNavLink to="/matched-reports" onClick={() => setMenuOpen(false)}>Matched Reports</MobileNavLink>
                  </>
                )}
              </div>
              <div className="pt-4 pb-3 border-t border-gray-200">
                <div className="flex items-center px-4">
                  <div className="flex-shrink-0 mr-3">
                    {renderAvatar(true)}
                  </div>
                  <div>
                    <div className="text-base font-medium text-gray-800">{user.name}</div>
                    <div className="text-sm font-medium text-gray-500">{user.email}</div>
                  </div>
                </div>
                <div className="mt-3 space-y-1">
                  {!user.isAdmin && (
                    <MobileNavLink to="/profile" onClick={() => setMenuOpen(false)}>Your Profile</MobileNavLink>
                  )}
                  <MobileNavLink to="/settings" onClick={() => setMenuOpen(false)}>Settings</MobileNavLink>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-base font-medium text-red-600 hover:bg-red-50"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </>
          ) : (
            // --- LOGGED-OUT MOBILE MENU (Your requested links) ---
            <div className="pt-2 pb-3 space-y-1">
              <MobileNavLink to="/home" onClick={() => setMenuOpen(false)}>Home</MobileNavLink>
              <MobileNavLink to="/login" onClick={() => setMenuOpen(false)}>Sign In</MobileNavLink>
              <MobileNavLink to="/register" onClick={() => setMenuOpen(false)}>Register</MobileNavLink>
              <MobileNavLink to="/admin-login" onClick={() => setMenuOpen(false)}>Admin Login</MobileNavLink>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;