import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Import axios

const ReportLost = () => {
  const navigate = useNavigate(); // Add navigate
  const [formData, setFormData] = useState({
    itemName: '',
    description: '',
    location: '',
    dateLost: '',
    contactInfo: ''
  });
  const [itemImage, setItemImage] = useState(null); // Add file state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setItemImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Use FormData to send file and text
    const data = new FormData();
    data.append('type', 'lost');
    data.append('item.name', formData.itemName);
    data.append('item.description', formData.description);
    data.append('location', formData.location);
    data.append('contactInfo', formData.contactInfo);
    // You can also append dateLost if your backend model supports it
    // data.append('dateLost', formData.dateLost); 
    
    if (itemImage) {
      data.append('itemImage', itemImage);
    }

    try {
      const token = localStorage.getItem('token');
      // Use axios to send FormData
      const response = await axios.post(
        'http://localhost:5000/api/reports',
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`
            // Don't set Content-Type, axios does it for FormData
          }
        }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to report lost item');
      }

      setSuccess('Lost item reported successfully!');
      setFormData({
        itemName: '',
        description: '',
        location: '',
        dateLost: '',
        contactInfo: ''
      });
      setItemImage(null); // Clear the file input
      setTimeout(() => {
        navigate('/my-reports'); // Navigate to my reports page
      }, 2000);

    } catch (err) {
      setError(err.response?.data?.message || err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center relative bg-gradient-to-br from-red-100 to-yellow-100 py-12"
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-white/60 z-0" />
      <div className="relative z-10 w-full flex flex-col items-center justify-center py-10">
        <div className="w-full max-w-xl mx-auto rounded-3xl shadow-2xl bg-white/80 backdrop-blur-2xl p-10 border border-white/40 card-3d">
          {/* ... (your existing header) ... */}
          <div className="flex flex-col items-center mb-8">
            <div className="rounded-full bg-red-100 p-4 mb-4 float shimmer shadow-lg">
              <svg className="w-14 h-14 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728l1.5-1.5m-1.5-1.5l-1.5-1.5" />
              </svg>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-2 font-serif tracking-tight drop-shadow-lg">Report Lost Item</h1>
            <p className="text-gray-700 text-center mb-2">Please fill in the details about your lost item.</p>
            <p className="text-red-700 text-center font-semibold mb-4">Don't worry, your item might be closer than you think! 🔍</p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 animate-fade-in">
                <div className="flex items-center">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {success}
                </div>
              </div>
            )}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 animate-fade-in">
                <div className="flex items-center">
                  <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M5.07 19.07A9 9 0 1112 21a9 9 0 01-6.93-1.93z" />
                  </svg>
                  {error}
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                <div className="relative">
                  <input
                    type="text"
                    name="itemName"
                    value={formData.itemName}
                    onChange={handleChange}
                    className="appearance-none rounded-xl block w-full px-3 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm shadow-sm"
                    placeholder="Enter item name"
                    required
                  />
                  {/* You can add your icon back here if you want */}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <div className="relative">
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="appearance-none rounded-xl block w-full px-3 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm shadow-sm"
                    placeholder="Where did you lose it?"
                    required
                  />
                  {/* You can add your icon back here if you want */}
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <div className="relative">
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="appearance-none rounded-xl block w-full px-3 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm shadow-sm"
                    rows="3"
                    placeholder="Describe your lost item in detail"
                    required
                  />
                  {/* You can add your icon back here if you want */}
                </div>
              </div>
              <div>
                {/* --- THIS IS THE LINE I FIXED --- */}
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Lost</label>
                <div className="relative">
                  <input
                    type="date"
                    name="dateLost"
                    value={formData.dateLost}
                    onChange={handleChange}
                    className="appearance-none rounded-xl block w-full px-3 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm shadow-sm"
                  />
                  {/* You can add your icon back here if you want */}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Information</label>
                <div className="relative">
                  <input
                    type="text"
                    name="contactInfo"
                    value={formData.contactInfo}
                    onChange={handleChange}
                    className="appearance-none rounded-xl block w-full px-3 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm shadow-sm"
                    placeholder="Phone number or email"
                  />
                  {/* You can add your icon back here if you want */}
                </div>
              </div>
              
              {/* --- ADD FILE INPUT FOR LOST ITEM --- */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Image (Optional)</label>
                <input
                  type="file"
                  name="itemImage"
                  onChange={handleFileChange}
                  className="appearance-none rounded-xl block w-full p-2.5 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm shadow-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                />
              </div>
              {/* ------------------------------------ */}

            </div>
            <div>
              <button
                type="submit"
                disabled={loading}
                className="btn-hover w-full py-3 px-4 bg-red-500 text-white rounded-xl font-bold text-lg hover:bg-red-600 transition-colors duration-300 shadow-md focus:outline-none focus:ring-2 focus:ring-red-400 focus:ring-offset-2 disabled:opacity-50 flex justify-center items-center"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </div>
                ) : (
                  'Report Lost Item'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReportLost;