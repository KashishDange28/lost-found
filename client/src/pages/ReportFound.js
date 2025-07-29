import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ReportFound = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    item: {
      name: '',
      description: ''
    },
    location: '',
    contactInfo: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'itemName') {
      setFormData(prev => ({
        ...prev,
        item: {
          ...prev.item,
          name: value
        }
      }));
    } else if (name === 'description') {
      setFormData(prev => ({
        ...prev,
        item: {
          ...prev.item,
          description: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:5000/api/reports',
        {
          type: 'found',
          item: formData.item,
          location: formData.location,
          contactInfo: formData.contactInfo
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      setSuccess('Report submitted successfully!');
      setTimeout(() => {
        navigate('/my-reports');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center relative bg-gradient-to-br from-green-100 to-blue-100 py-12"
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-white/60 z-0" />
      <div className="relative z-10 w-full flex flex-col items-center justify-center py-10">
        <div className="w-full max-w-xl mx-auto rounded-3xl shadow-2xl bg-white/80 backdrop-blur-2xl p-10 border border-white/40 card-3d">
          {/* Step Indicator */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-green-500 text-white font-bold">1</div>
              <span className="font-semibold text-green-700">Fill Details</span>
              <span className="mx-2 text-gray-400">→</span>
              <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-gray-500 font-bold">2</div>
              <span className="font-semibold text-gray-500">Submit</span>
            </div>
          </div>
          <div className="flex flex-col items-center mb-8">
            <div className="rounded-full bg-green-100 p-4 mb-4 float shimmer shadow-lg">
              <svg className="w-14 h-14 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 mb-2 font-serif tracking-tight drop-shadow-lg">Report Found Item</h1>
            <p className="text-gray-700 text-center mb-2">Help return a lost item to its owner by filling out the details below.</p>
            <p className="text-green-700 text-center font-semibold mb-4">Be a hero on campus! 🦸‍♂️</p>
          </div>
          <form className="space-y-6" onSubmit={handleSubmit}>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                <input
                  type="text"
                  name="itemName"
                  value={formData.item.name}
                  onChange={handleChange}
                  className="appearance-none rounded-xl block w-full px-3 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm shadow-sm"
                  placeholder="Enter item name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Found Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="appearance-none rounded-xl block w-full px-3 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm shadow-sm"
                  placeholder="Where did you find it?"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.item.description}
                  onChange={handleChange}
                  className="appearance-none rounded-xl block w-full px-3 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm shadow-sm"
                  placeholder="Describe the item"
                  rows="4"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Information</label>
                <input
                  type="text"
                  name="contactInfo"
                  value={formData.contactInfo}
                  onChange={handleChange}
                  className="appearance-none rounded-xl block w-full px-3 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm shadow-sm"
                  placeholder="How can the owner contact you?"
                  required
                />
              </div>
            </div>
            <button
              className="btn-hover w-full py-3 px-4 bg-green-500 text-white rounded-xl font-bold text-lg hover:bg-green-600 transition-colors duration-300 shadow-md focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 flex justify-center items-center"
              type="submit"
              disabled={!!success}
            >
              {success ? (
                <span>Submitted!</span>
              ) : (
                'Submit Report'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReportFound;
