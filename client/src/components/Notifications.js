import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Not authenticated');
          return;
        }
        
        const response = await axios.get(
          'http://localhost:5000/api/reports/notifications',
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        setNotifications(response.data.notifications);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const markAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Not authenticated');
        return;
      }

      await axios.patch(
        `http://localhost:5000/api/reports/notifications/${notificationId}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setNotifications(prev => 
        prev.map(n => 
          n._id === notificationId ? { ...n, read: true } : n
        )
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to mark notification as read');
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md">
        <p className="text-gray-500">No notifications yet</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Notifications</h2>
      <div className="space-y-4">
        {notifications.map((notification) => (
          <div
            key={notification._id}
            className={`p-4 rounded ${notification.read ? 'bg-gray-50' : 'bg-blue-50'}`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">{notification.message}</p>
                {notification.report && (
                  <p className="text-sm text-gray-600 mt-1">
                    {notification.type === 'match_found' 
                      ? 'Your lost item was found' 
                      : 'You reported a found item'}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  {new Date(notification.createdAt).toLocaleDateString()}
                </p>
              </div>
              {!notification.read && (
                <button
                  onClick={() => markAsRead(notification._id)}
                  className="text-blue-500 hover:text-blue-700 text-sm"
                >
                  Mark as read
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Notifications;
