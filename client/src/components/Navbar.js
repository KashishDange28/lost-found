import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Notifications from './Notifications';

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between">
          <div className="flex space-x-7">
            <div>
              <Link to="/" className="flex items-center py-4">
                <span className="font-semibold text-gray-500 text-lg">Lost & Found</span>
              </Link>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className="py-4 px-2 text-gray-500 hover:text-gray-900">Home</Link>
            <Link to="/report-lost" className="py-4 px-2 text-gray-500 hover:text-gray-900">Report Lost</Link>
            <Link to="/report-found" className="py-4 px-2 text-gray-500 hover:text-gray-900">Report Found</Link>
            <Link to="/my-reports" className="py-4 px-2 text-gray-500 hover:text-gray-900">My Reports</Link>
            <button
              onClick={handleLogout}
              className="py-2 px-4 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
      {token && (
        <div className="max-w-6xl mx-auto px-4">
          <Notifications />
        </div>
      )}
    </nav>
  );
};

export default Navbar;
