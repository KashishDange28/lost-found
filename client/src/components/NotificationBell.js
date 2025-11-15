import React, { useState, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { BellIcon } from '@heroicons/react/24/outline';

const NotificationBell = () => {
  const { notifications, markNotificationAsRead } = useSocket();
  const [showDropdown, setShowDropdown] = useState(false);
  const [allNotifications, setAllNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);

  useEffect(() => {
    // Fetch existing notifications from server
    const fetchNotifications = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/reports/notifications', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setAllNotifications(data.notifications || []);
        }
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    };

    fetchNotifications();
  }, []);

  // Combine server notifications with real-time notifications
  const combinedNotifications = [...notifications, ...allNotifications];
  const unreadCount = combinedNotifications.filter(n => !n.read).length;

  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markNotificationAsRead(notification.notificationId || notification._id);
    }
    
    // --- THIS IS THE UPDATED LOGIC ---
    // 'matchedUserInfo' comes from real-time socket message
    // 'matchedReport' comes from fetching old notifications from DB
    
    const matchedInfo = notification.matchedUserInfo; // Real-time info
    const matchedReport = notification.matchedReport; // DB info

    if (notification.type === 'match') {
      if (matchedInfo) {
        // Case 1: Real-time notification
        setSelectedNotification({
          name: matchedInfo.name,
          email: matchedInfo.email,
          contactInfo: matchedInfo.contactInfo
        });
      } else if (matchedReport && matchedReport.user) {
        // Case 2: Clicked on old notification from DB
        setSelectedNotification({
          name: matchedReport.user.name,
          email: matchedReport.user.email,
          contactInfo: matchedReport.contactInfo // This is the 'found' item's contact info
        });
      } else {
        // Fallback in case something is wrong
        setShowDropdown(false);
      }
    } else {
      setShowDropdown(false);
    }
    // --- END OF UPDATED LOGIC ---
  };

  const closeContactModal = () => {
    setSelectedNotification(null);
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        <BellIcon className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">
            {combinedNotifications.length === 0 ? (
              <div className="px-4 py-2 text-sm text-gray-500">
                No notifications
              </div>
            ) : (
              combinedNotifications.slice(0, 5).map((notification, index) => (
                <div
                  key={index}
                  onClick={() => handleNotificationClick(notification)}
                  className={`px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 ${
                    !notification.read ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    </div>
                    <div className="ml-3 flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(notification.createdAt || Date.now()).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
            {combinedNotifications.length > 5 && (
              <div className="px-4 py-2 text-sm text-blue-600 hover:bg-gray-50 cursor-pointer">
                View all notifications
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- UPDATED Contact Details Modal --- */}
      {selectedNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Contact Details
              </h3>
              <button
                onClick={closeContactModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-700">Name:</p>
                <p className="text-lg text-gray-900">{selectedNotification.name}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-gray-700">Email:</p>
                <p className="text-lg text-gray-900">{selectedNotification.email}</p>
              </div>
              
              {selectedNotification.contactInfo && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Contact Info (from 'found' report):</p>
                  <p className="text-lg text-gray-900">{selectedNotification.contactInfo}</p>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex space-x-3">
              <button
                onClick={closeContactModal}
                className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.open(`mailto:${selectedNotification.email}`, '_blank');
                  closeContactModal();
                }}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Send Email
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;