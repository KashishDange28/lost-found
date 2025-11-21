import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL, { endpoints } from '../config/api';
import { 
  ChartBarIcon, 
  DocumentTextIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  UserGroupIcon,
  ClockIcon,
  CheckIcon,
  // XMarkIcon, // <-- REMOVED (unused)
  // EyeIcon, // <-- REMOVED (unused)
  EnvelopeIcon,
  TrashIcon,
  PencilIcon,
  LinkIcon 
} from '@heroicons/react/24/outline';

// --- Pairing Bar Component ---
const PairingBar = ({ lostItem, foundItem, onApprove, onClear, loading }) => {
  const canApprove = lostItem && foundItem;

  return (
    <div className="sticky top-16 z-40 bg-white shadow-lg p-4 rounded-b-xl border-t border-gray-200">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Lost Item Slot */}
            <div className={`p-4 rounded-lg ${lostItem ? 'bg-red-50 border border-red-200' : 'bg-gray-100 border border-gray-200'}`}>
              <h4 className="font-semibold text-gray-900 mb-2">Selected Lost Item</h4>
              {lostItem ? (
                <>
                  <p className="text-gray-700 font-medium">{lostItem.item.name}</p>
                  <p className="text-sm text-gray-600">User: {lostItem.user?.name || 'Deleted User'}</p>
                </>
              ) : (
                <p className="text-sm text-gray-500">Select a "Lost" report from the list below...</p>
              )}
            </div>
            
            {/* Found Item Slot */}
            <div className={`p-4 rounded-lg ${foundItem ? 'bg-green-50 border border-green-200' : 'bg-gray-100 border border-gray-200'}`}>
              <h4 className="font-semibold text-gray-900 mb-2">Selected Found Item</h4>
              {foundItem ? (
                <>
                  <p className="text-gray-700 font-medium">{foundItem.item.name}</p>
                  <p className="text-sm text-gray-600">User: {foundItem.user?.name || 'Deleted User'}</p>
                </>
              ) : (
                <p className="text-sm text-gray-500">Select a "Found" report from the list below...</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row gap-2">
            <button
              onClick={onApprove}
              disabled={!canApprove || loading}
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-all duration-200 font-medium flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <CheckIcon className="h-5 w-5" />
              )}
              <span>Approve Match</span>
            </button>
            <button
              onClick={onClear}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Clear Selection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
// --- END Pairing Bar Component ---


const AdminDashboard = () => {
  const [allReports, setAllReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  // --- STATE for Manual Pairing ---
  const [selectedLostItem, setSelectedLostItem] = useState(null);
  const [selectedFoundItem, setSelectedFoundItem] = useState(null);
  const [pairingLoading, setPairingLoading] = useState(false);
  // ---------------------------------

  useEffect(() => {
    fetchAllReports();
  }, []);

  const fetchAllReports = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get(`${API_BASE_URL}${endpoints.admin.allReports}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        setAllReports(response.data.reports);
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

  const handleDeleteReport = async (reportId) => {
    if (window.confirm('Are you sure you want to permanently delete this report? This is for all users.')) {
      try {
        await axios.delete(`${API_BASE_URL}${endpoints.admin.deleteReport(reportId)}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        // Refresh UI
        setAllReports(prev => prev.filter(report => report._id !== reportId));
      } catch (err) {
        console.error('Error deleting report:', err);
        alert('Failed to delete report.');
      }
    }
  };

  // --- HANDLER for selecting an item ---
  const handleSelectForMatch = (report) => {
    if (report.type === 'lost') {
      setSelectedLostItem(report);
    } else if (report.type === 'found') {
      setSelectedFoundItem(report);
    }
  };

  // --- HANDLER for clearing selection ---
  const handleClearSelection = () => {
    setSelectedLostItem(null);
    setSelectedFoundItem(null);
  };

  // --- HANDLER for approving the pair ---
  const handleApprovePairing = async () => {
    if (!selectedLostItem || !selectedFoundItem) {
      alert("You must select one 'lost' and one 'found' item to pair.");
      return;
    }

    setPairingLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}${endpoints.admin.approveMatch}`, {
        lostReportId: selectedLostItem._id,
        foundReportId: selectedFoundItem._id
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        // Update local state to reflect the match
        setAllReports(prev => prev.map(report => {
          if (report._id === selectedLostItem._id || report._id === selectedFoundItem._id) {
            return { ...report, status: 'matched' };
          }
          return report;
        }));
        // Clear selection
        handleClearSelection();
        alert('Match Approved! Users have been notified.');
      }
    } catch (error) {
      console.error('Error approving match:', error);
      alert(`Failed to approve match: ${error.response?.data?.message || 'Server error'}`);
    } finally {
      setPairingLoading(false);
    }
  };


  // --- Helper Functions ---
  const getTypeIcon = (type) => { 
    return type === 'lost' ? ExclamationTriangleIcon : CheckCircleIcon;
  };

  const getItemName = (item) => {
    if (typeof item === 'string') return item;
    if (item && typeof item === 'object' && item.name) return item.name;
    return 'Unknown Item';
  };
  
  const getItemImageUrl = (item) => {
    if (item && typeof item === 'object' && item.imageUrl) {
      return item.imageUrl;
    }
    return null;
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'active':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'matched':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resolved':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'closed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTypeClass = (type) => {
    return type === 'lost' ? 'bg-red-100 text-red-800 border-red-200' : 'bg-green-100 text-green-800 border-green-200';
  };


  const filteredReports = allReports.filter(report => {
    if (filter === 'all') return true;
    if (filter === 'lost') return report.type === 'lost';
    if (filter === 'found') return report.type === 'found';
    if (filter === 'active') return report.status === 'active';
    if (filter === 'matched') return report.status === 'matched';
    return true;
  });

  const stats = {
    total: allReports.length,
    lost: allReports.filter(r => r.type === 'lost').length,
    found: allReports.filter(r => r.type === 'found').length,
    active: allReports.filter(r => r.status === 'active').length,
    matched: allReports.filter(r => r.status === 'matched').length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto"></div>
            <p className="mt-6 text-xl text-gray-700 font-medium">Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100">
      
      {/* --- RENDER THE NEW PAIRING BAR --- */}
      {(selectedLostItem || selectedFoundItem) && (
        <PairingBar
          lostItem={selectedLostItem}
          foundItem={selectedFoundItem}
          onApprove={handleApprovePairing}
          onClear={handleClearSelection}
          loading={pairingLoading}
        />
      )}
      {/* ---------------------------------- */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full mb-6">
            <ChartBarIcon className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Admin Dashboard</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Manage all lost and found reports, approve matches, and monitor system activity.
          </p>
        </div>

        {/* ERROR DISPLAY */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 shadow-lg mb-8">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-8 w-8 text-red-500 mr-3" />
              <div>
                <h3 className="text-lg font-semibold text-red-800">An Error Occurred</h3>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
            </div>
            <button 
              onClick={() => {
                setError(''); // Clear error on retry
                fetchAllReports();
              }}
              className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          {/* Total Reports */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DocumentTextIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Reports</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          {/* Lost Items */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Lost Items</p>
                <p className="text-2xl font-bold text-gray-900">{stats.lost}</p>
              </div>
            </div>
          </div>
          {/* Found Items */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Found Items</p>
                <p className="text-2xl font-bold text-gray-900">{stats.found}</p>
              </div>
            </div>
          </div>
          {/* Active */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <ClockIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active</p>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              </div>
            </div>
          </div>
          
          {/* Approved Matches */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CheckIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approved Matches</p>
                <p className="text-2xl font-bold text-gray-900">{stats.matched}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: 'All Reports', count: stats.total },
                { key: 'lost', label: 'Lost Items', count: stats.lost },
                { key: 'found', label: 'Found Items', count: stats.found },
                { key: 'active', label: 'Active', count: stats.active },
                { key: 'matched', label: 'Approved', count: stats.matched }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === tab.key
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Reports List */}
        <div className="space-y-6">
          {filteredReports.map((report) => {
            const TypeIcon = getTypeIcon(report.type);
            const itemName = getItemName(report.item);
            const itemImageUrl = getItemImageUrl(report.item);
            
            const isSelected = (report.type === 'lost' && selectedLostItem?._id === report._id) || 
                               (report.type === 'found' && selectedFoundItem?._id === report._id);

            return (
              <div key={report._id} className={`bg-white rounded-2xl shadow-xl overflow-hidden ${isSelected ? 'border-4 border-purple-600' : 'border-4 border-transparent'}`}>
                <div className="bg-gradient-to-r from-gray-800 to-gray-900 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                        <TypeIcon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-white">{itemName}</h3>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeClass(report.type)}`}>
                            {report.type.toUpperCase()}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusClass(report.status)}`}>
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

                <div className="p-6">
                  {itemImageUrl && (
                      <div className="mb-6">
                        <img
                          src={( () => {
                            const url = itemImageUrl.replace(/\\/g, '/');
                            if (url.startsWith('http://') || url.startsWith('https://')) return url;
                            return `${API_BASE_URL.replace(/\/+$/, '')}/${url.replace(/^\/+/, '')}`;
                          })()}
                          alt={itemName}
                          className="w-full h-auto max-h-72 object-cover rounded-lg shadow-lg border border-gray-200"
                        />
                      </div>
                    )}
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Item Details</h4>
                      <p className="text-gray-600 mb-2"><strong>Location:</strong> {report.location}</p>
                      {report.contactInfo && (
                        <p className="text-gray-600 mb-2"><strong>Contact:</strong> {report.contactInfo}</p>
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">User Information</h4>
                      <div className="flex items-center space-x-2 mb-1">
                        <UserGroupIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">{report.user ? report.user.name : 'Deleted User'}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">{report.user ? report.user.email : 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex flex-wrap gap-3 border-t pt-4">
                    <button 
                      onClick={() => handleSelectForMatch(report)}
                      disabled={report.status !== 'active'}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium flex items-center space-x-2 disabled:opacity-50"
                    >
                      <LinkIcon className="h-4 w-4" />
                      <span>{isSelected ? 'Selected' : 'Select for Match'}</span>
                    </button>
                    <button 
                      onClick={() => alert('Edit feature not yet implemented.')}
                      className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium flex items-center space-x-2">
                      <PencilIcon className="h-4 w-4" />
                      <span>Edit</span>
                    </button>
                    <button 
                      onClick={() => handleDeleteReport(report._id)}
                      className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors font-medium flex items-center space-x-2">
                      <TrashIcon className="h-4 w-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                  
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;