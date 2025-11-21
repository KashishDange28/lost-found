import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL, { endpoints } from '../config/api';
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
  TrashIcon,
  EnvelopeIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';


// --- EDIT MODAL COMPONENT ---
const EditReportModal = ({ report, onClose, onReportUpdated }) => {
  const [formData, setFormData] = useState({
    itemName: report.item.name || '',
    description: report.item.description || '',
    location: report.location || '',
    contactInfo: report.contactInfo || ''
  });
  const [itemImage, setItemImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(
    (() => {
      if (!report.item || !report.item.imageUrl) return null;
      const url = report.item.imageUrl.replace(/\\/g, '/');
      if (url.startsWith('http://') || url.startsWith('https://')) return url;
      return `${API_BASE_URL.replace(/\/+$/, '')}/${url.replace(/^\/+/, '')}`;
    })()
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setItemImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const data = new FormData();
    data.append('item.name', formData.itemName);
    data.append('item.description', formData.description);
    data.append('location', formData.location);
    if (formData.contactInfo) {
      data.append('contactInfo', formData.contactInfo);
    }
    if (itemImage) {
      data.append('itemImage', itemImage);
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        `${API_BASE_URL}${endpoints.reports.update(report._id)}`,
        data,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        onReportUpdated(response.data.report); // Send updated report back to list
        onClose(); // Close modal
      } else {
        setError(response.data.message || 'Failed to update report');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-semibold text-gray-900">Edit Report</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
            <input
              type="text"
              name="itemName"
              value={formData.itemName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              required
            />
          </div>
          {report.type === 'found' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Information</label>
              <input
                type="text"
                name="contactInfo"
                value={formData.contactInfo}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Item Image</label>
            {imagePreview && (
              <img src={imagePreview} alt="Preview" className="w-full h-auto max-h-48 object-cover rounded-md mb-2" />
            )}
            <input
              type="file"
              name="itemImage"
              onChange={handleFileChange}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
// --- END EDIT MODAL COMPONENT ---


const MyReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentReportToEdit, setCurrentReportToEdit] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get(`${API_BASE_URL}${endpoints.reports.list}`, {
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

  const handleDelete = async (reportId) => {
    if (window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.delete(
          `${API_BASE_URL}${endpoints.reports.delete(reportId)}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        if (response.data.success) {
          setReports(prevReports => prevReports.filter(report => report._id !== reportId));
        } else {
          alert('Failed to delete report. Please try again.');
        }
      } catch (err) {
        console.error('Error deleting report:', err);
        alert('An error occurred while deleting the report.');
      }
    }
  };

  const openEditModal = (report) => {
    setCurrentReportToEdit(report);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setCurrentReportToEdit(null);
    setIsEditModalOpen(false);
  };

  const handleReportUpdated = (updatedReport) => {
    setReports(prevReports => 
      prevReports.map(report => 
        report._id === updatedReport._id ? updatedReport : report
      )
    );
  };

  // --- HELPER FUNCTIONS ---
  
  // UNUSED FUNCTION REMOVED
  // const getStatusColor = (status) => { ... };

  // UNUSED FUNCTION REMOVED
  // const getTypeColor = (type) => { ... };

  // UNUSED FUNCTION REMOVED
  // const getTypeIcon = (type) => { ... };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return ClockIcon;
      case 'matched': 
        return CheckCircleIcon;
      case 'resolved':
        return CheckCircleIcon;
      case 'closed':
        return EyeIcon;
      default:
        return ClockIcon;
    }
  };

  const getItemName = (item) => {
    if (typeof item === 'string') return item;
    if (item && typeof item === 'object' && item.name) return item.name;
    return 'Unknown Item';
  };

  const getItemDescription = (item) => {
    if (typeof item === 'string') return null;
    if (item && typeof item === 'object' && item.description) return item.description;
    return null;
  };

  const getItemImageUrl = (item) => {
    if (item && typeof item === 'object' && item.imageUrl) return item.imageUrl;
    return null;
  };
  // --- END OF HELPER FUNCTIONS ---


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
  
  // We need these for the inline styles
  const getStatusClass = (status) => {
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

  const getTypeClass = (type) => {
    return type === 'lost' ? 'bg-red-100 text-red-800 border-red-200' : 'bg-green-100 text-green-800 border-green-200';
  };
  
  const getTypeIcon = (type) => {
    return type === 'lost' ? ExclamationTriangleIcon : CheckCircleIcon;
  };


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
          {/* Stats */}
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
              const itemImageUrl = getItemImageUrl(report.item); 
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

                  {/* Report Content */}
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

                    {/* --- MATCHED USER DETAILS --- */}
                    {report.status === 'matched' && report.matchedUser && (
                      <div className="mt-6 border-t pt-6">
                        <h4 className="text-lg font-semibold text-blue-800 mb-4">🎉 Match Found!</h4>
                        <p className="text-gray-700 mb-4">Your item has been matched! Please contact the other user to arrange a return.</p>
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
                          <div className="flex items-center space-x-3">
                            <UserIcon className="h-5 w-5 text-blue-600" />
                            <span className="font-medium text-gray-900">{report.matchedUser.name}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <EnvelopeIcon className="h-5 w-5 text-blue-600" />
                            <a href={`mailto:${report.matchedUser.email}`} className="text-blue-700 hover:underline">{report.matchedUser.email}</a>
                          </div>
                          {report.matchedUser.contactInfo && (
                            <div className="flex items-center space-x-3">
                              <UserIcon className="h-5 w-5 text-blue-600" />
                              <span className="text-gray-900">{report.matchedUser.contactInfo}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {/* ---------------------------------- */}


                    {/* Action Buttons */}
                    <div className="mt-6 flex flex-wrap gap-3 border-t pt-6">
                      <button 
                        onClick={() => alert('View details modal not yet implemented.')}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center space-x-2">
                        <EyeIcon className="h-4 w-4" />
                        <span>View Details</span>
                      </button>
                      <button 
                        onClick={() => openEditModal(report)} // <-- HOOK UP THE MODAL
                        className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors font-medium flex items-center space-x-2"
                        disabled={report.status === 'matched'} // Disable editing if already matched
                      >
                        <PencilIcon className="h-4 w-4" />
                        <span>Edit</span>
                      </button>
                      <button 
                        onClick={() => handleDelete(report._id)}
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

      {/* --- RENDER THE MODAL --- */}
      {isEditModalOpen && (
        <EditReportModal
          report={currentReportToEdit}
          onClose={closeEditModal}
          onReportUpdated={handleReportUpdated}
        />
      )}
      {/* ------------------------ */}
    </div>
  );
};

export default MyReports;