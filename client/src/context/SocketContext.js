import React, { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';
import API_BASE_URL, { endpoints } from '../config/api';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Connect to Socket.IO server
      const newSocket = io(API_BASE_URL);
      setSocket(newSocket);

      // Join the user's room
      newSocket.emit('join', user._id);

      // Listen for notifications
      newSocket.on('notification', (notification) => {
        console.log('Received notification:', notification);
        setNotifications(prev => [notification, ...prev]);
        
        // Show browser notification
        if (Notification.permission === 'granted') {
          const browserNotification = new Notification(notification.title, {
            body: notification.message,
            icon: '/favicon.ico',
            requireInteraction: notification.type === 'match' // Keep match notifications open longer
          });
          
          // Add click handler for match notifications
          if (notification.type === 'match' && notification.matchedUserInfo) {
            browserNotification.onclick = () => {
              // You could open a modal or navigate to a specific page
              console.log('Match notification clicked - user info:', notification.matchedUserInfo);
            };
          }
        }
      });

      return () => {
        newSocket.close();
      };
    }
  }, [isAuthenticated, user]);

  const markNotificationAsRead = async (notificationId) => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoints.reports.readNotification(notificationId)}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.notificationId === notificationId 
              ? { ...notif, read: true }
              : notif
          )
        );
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const value = {
    socket,
    notifications,
    markNotificationAsRead,
    clearNotifications
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
}; 