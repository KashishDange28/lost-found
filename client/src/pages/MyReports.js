import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  DocumentTextIcon, 
  UserIcon, 
  MapPinIcon, 
  CalendarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

const MyReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get('http://localhost:5000/api/reports', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        setReports(response.data.reports);
      } else {
        setError('Failed to fetch reports');
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
      setError('Failed to fetch reports. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'resolved':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'closed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeColor = (type) => {
    return type === 'lost' ? 'bg-red-100 text-red-800 border-red-200' : 'bg-green-100 text-green-800 border-green-200';
  };

  const getTypeIcon = (type) => {
    return type === 'lost' ? ExclamationTriangleIcon : CheckCircleIcon;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return ClockIcon;
      case 'resolved':
        return CheckCircleIcon;
      case 'closed':
        return EyeIcon;
      default:
        return ClockIcon;
    }
  };

  // Helper function to get item name safely
  const getItemName = (item) => {
    if (typeof item === 'string') {
      return item;
    }
    if (item && typeof item === 'object' && item.name) {
      return item.name;
    }
    return 'Unknown Item';
  };

  // Helper function to get item description safely
  const getItemDescription = (item) => {
    if (typeof item === 'string') {
      return null;
    }
    if (item && typeof item === 'object' && item.description) {
      return item.description;
    }
    return null;
  };

  const filteredReports = reports.filter(report => {
    if (filter === 'all') return true;
    if (filter === 'lost') return report.type === 'lost';
    if (filter === 'found') return report.type === 'found';
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
            <p className="mt-6 text-xl text-gray-700 font-medium">Loading your reports...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 shadow-lg">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-500 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-red-800">Error Loading Reports</h3>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
            </div>
            <button 
              onClick={fetchReports}
              className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-6">
            <DocumentTextIcon className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">My Reports</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Manage and track all your lost and found item reports in one place.
          </p>
        </div>

        {/* Stats and Filters */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">{reports.length}</div>
              <div className="text-sm text-gray-600">Total Reports</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-red-600">{reports.filter(r => r.type === 'lost').length}</div>
              <div className="text-sm text-gray-600">Lost Items</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{reports.filter(r => r.type === 'found').length}</div>
              <div className="text-sm text-gray-600">Found Items</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{reports.filter(r => r.status === 'active').length}</div>
              <div className="text-sm text-gray-600">Active</div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 justify-center">
            {[
              { key: 'all', label: 'All Reports', count: reports.length },
              { key: 'lost', label: 'Lost Items', count: reports.filter(r => r.type === 'lost').length },
              { key: 'found', label: 'Found Items', count: reports.filter(r => r.type === 'found').length }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  filter === tab.key
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>

        {filteredReports.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md mx-auto">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <DocumentTextIcon className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No Reports Found</h3>
              <p className="text-gray-600 mb-6">
                {filter === 'all' 
                  ? "You haven't created any reports yet. Start by reporting a lost or found item!"
                  : `You haven't created any ${filter} reports yet.`
                }
              </p>
              <div className="space-y-3">
                <button 
                  onClick={() => window.location.href = '/report-lost'}
                  className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Report Lost Item
                </button>
                <button 
                  onClick={() => window.location.href = '/report-found'}
                  className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Report Found Item
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredReports.map((report) => {
              const itemName = getItemName(report.item);
              const itemDescription = getItemDescription(report.item);
              const TypeIcon = getTypeIcon(report.type);
              const StatusIcon = getStatusIcon(report.status);
              
              return (
                <div key={report._id} className="bg-white rounded-2xl shadow-xl overflow-hidden">
                  {/* Report Header */}
                  <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                          <TypeIcon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">{itemName}</h3>
                          <div className="flex items-center space-x-3 mt-1">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor(report.type)}`}>
                              {report.type.toUpperCase()}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(report.status)}`}>
                              {report.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-white">
                        <div className="text-sm opacity-90">
                          {new Date(report.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Report Content */}
                  <div className="p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Item Details */}
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-gray-900">Item Details</h4>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <MapPinIcon className="h-5 w-5 text-gray-400" />
                            <span className="text-gray-700">{report.location}</span>
                          </div>
                          {itemDescription && (
                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-sm text-gray-600">{itemDescription}</p>
                            </div>
                          )}
                          {report.description && (
                            <div className="bg-blue-50 rounded-lg p-3">
                              <p className="text-sm text-blue-800">{report.description}</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Contact & Status */}
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-gray-900">Contact & Status</h4>
                        <div className="space-y-3">
                          {report.contactInfo && (
                            <div className="flex items-center space-x-3">
                              <UserIcon className="h-5 w-5 text-gray-400" />
                              <span className="text-gray-700">{report.contactInfo}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-3">
                            <CalendarIcon className="h-5 w-5 text-gray-400" />
                            <span className="text-gray-700">
                              Created: {new Date(report.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <StatusIcon className="h-5 w-5 text-gray-400" />
                            <span className="text-gray-700">Status: {report.status}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 flex flex-wrap gap-3">
                      <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2">
                        <EyeIcon className="h-4 w-4" />
                        <span>View Details</span>
                      </button>
                      <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium flex items-center space-x-2">
                        <PencilIcon className="h-4 w-4" />
                        <span>Edit</span>
                      </button>
                      <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center space-x-2">
                        <TrashIcon className="h-4 w-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Refresh Button */}
        <div className="text-center mt-12">
          <button
            onClick={fetchReports}
            className="bg-gray-800 text-white px-8 py-3 rounded-lg hover:bg-gray-900 transition-colors font-medium flex items-center space-x-2 mx-auto"
          >
            <DocumentTextIcon className="h-5 w-5" />
            <span>Refresh Reports</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyReports;
