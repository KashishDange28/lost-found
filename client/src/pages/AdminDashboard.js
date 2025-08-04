import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ChartBarIcon, 
  DocumentTextIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  UserGroupIcon,
  ClockIcon,
  CheckIcon,
  XMarkIcon,
  EyeIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

const AdminDashboard = () => {
  const [allReports, setAllReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedMatches, setSelectedMatches] = useState([]);
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchResults, setMatchResults] = useState([]);

  useEffect(() => {
    fetchAllReports();
  }, []);

  const fetchAllReports = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get('http://localhost:5000/api/admin/all-reports', {
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

  const findMatches = () => {
    const lostReports = allReports.filter(r => r.type === 'lost' && r.status === 'active');
    const foundReports = allReports.filter(r => r.type === 'found' && r.status === 'active');
    
    const matches = [];
    
    lostReports.forEach(lostReport => {
      foundReports.forEach(foundReport => {
        const lostItemName = typeof lostReport.item === 'string' ? lostReport.item : lostReport.item.name;
        const foundItemName = typeof foundReport.item === 'string' ? foundReport.item : foundReport.item.name;
        
        // Simple keyword matching
        const lostKeywords = lostItemName.toLowerCase().split(' ').filter(k => k.length > 2);
        const foundKeywords = foundItemName.toLowerCase().split(' ').filter(k => k.length > 2);
        
        const commonKeywords = lostKeywords.filter(k => foundKeywords.includes(k));
        
        if (commonKeywords.length > 0) {
          matches.push({
            lostReport,
            foundReport,
            commonKeywords,
            matchScore: commonKeywords.length
          });
        }
      });
    });
    
    setMatchResults(matches);
    setShowMatchModal(true);
  };

  const approveMatch = async (match) => {
    try {
      const response = await axios.post('http://localhost:5000/api/admin/approve-match', {
        lostReportId: match.lostReport._id,
        foundReportId: match.foundReport._id
      }, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        // Remove the approved match from results
        setMatchResults(prev => prev.filter(m => 
          m.lostReport._id !== match.lostReport._id || 
          m.foundReport._id !== match.foundReport._id
        ));
        
        // Update reports status
        setAllReports(prev => prev.map(report => {
          if (report._id === match.lostReport._id || report._id === match.foundReport._id) {
            return { ...report, status: 'matched' };
          }
          return report;
        }));
      }
    } catch (error) {
      console.error('Error approving match:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
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

  const getTypeColor = (type) => {
    return type === 'lost' ? 'bg-red-100 text-red-800 border-red-200' : 'bg-green-100 text-green-800 border-green-200';
  };

  const getTypeIcon = (type) => {
    return type === 'lost' ? ExclamationTriangleIcon : CheckCircleIcon;
  };

  const getItemName = (item) => {
    if (typeof item === 'string') return item;
    if (item && typeof item === 'object' && item.name) return item.name;
    return 'Unknown Item';
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
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

          <div className="bg-white rounded-2xl shadow-xl p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CheckIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Matched</p>
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
                { key: 'matched', label: 'Matched', count: stats.matched }
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

            <button
              onClick={findMatches}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-medium flex items-center space-x-2"
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
              <span>Find Matches</span>
            </button>
          </div>
        </div>

        {/* Reports List */}
        <div className="space-y-6">
          {filteredReports.map((report) => {
            const TypeIcon = getTypeIcon(report.type);
            const itemName = getItemName(report.item);
            
            return (
              <div key={report._id} className="bg-white rounded-2xl shadow-xl overflow-hidden">
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

                <div className="p-6">
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
                        <span className="text-gray-600">{report.user.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">{report.user.email}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Match Modal */}
        {showMatchModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Potential Matches</h2>
                  <button
                    onClick={() => setShowMatchModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {matchResults.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No potential matches found.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {matchResults.map((match, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="bg-red-50 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-900 mb-2">Lost Item</h4>
                            <p className="text-gray-700 mb-2">{getItemName(match.lostReport.item)}</p>
                            <p className="text-sm text-gray-600">User: {match.lostReport.user.name}</p>
                            <p className="text-sm text-gray-600">Email: {match.lostReport.user.email}</p>
                          </div>
                          <div className="bg-green-50 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-900 mb-2">Found Item</h4>
                            <p className="text-gray-700 mb-2">{getItemName(match.foundReport.item)}</p>
                            <p className="text-sm text-gray-600">User: {match.foundReport.user.name}</p>
                            <p className="text-sm text-gray-600">Email: {match.foundReport.user.email}</p>
                          </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Matching keywords: {match.commonKeywords.join(', ')}</p>
                          </div>
                          <button
                            onClick={() => approveMatch(match)}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                          >
                            Approve Match
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard; 