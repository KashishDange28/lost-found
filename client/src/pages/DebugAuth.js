import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API_BASE_URL from '../config/api';

const DebugAuth = () => {
  const { user, loading } = useAuth();
  const [localStorageData, setLocalStorageData] = useState({});

  useEffect(() => {
    // Get all localStorage data
    const userData = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    setLocalStorageData({
      user: userData ? JSON.parse(userData) : null,
      token: token ? token.substring(0, 20) + '...' : null
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Authentication Debug</h1>
          
          <div className="space-y-6">
            {/* Auth Context Data */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Auth Context Data</h2>
              <div className="bg-gray-100 p-4 rounded">
                <pre className="text-sm text-gray-800 overflow-auto">
                  {JSON.stringify({ user, loading }, null, 2)}
                </pre>
              </div>
            </div>

            {/* LocalStorage Data */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">LocalStorage Data</h2>
              <div className="bg-gray-100 p-4 rounded">
                <pre className="text-sm text-gray-800 overflow-auto">
                  {JSON.stringify(localStorageData, null, 2)}
                </pre>
              </div>
            </div>

            {/* User Details */}
            {user && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-3">User Details</h2>
                <div className="bg-blue-50 p-4 rounded">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Name:</p>
                      <p className="text-lg text-gray-900">{user.name || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Email:</p>
                      <p className="text-lg text-gray-900">{user.email || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">User ID:</p>
                      <p className="text-lg text-gray-900">{user._id || user.id || 'Not set'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Admin:</p>
                      <p className="text-lg text-gray-900">{user.isAdmin ? 'Yes' : 'No'}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Test Authentication */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Test API Call</h2>
              <button
                onClick={async () => {
                  try {
                    const response = await fetch(`${API_BASE_URL}/api/reports`, {
                      headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                      }
                    });
                    
                    if (response.ok) {
                      const data = await response.json();
                      alert('API call successful! Check console for data.');
                      console.log('API Response:', data);
                    } else {
                      alert('API call failed: ' + response.status);
                    }
                  } catch (error) {
                    alert('API call error: ' + error.message);
                  }
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Test API Authentication
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugAuth; 