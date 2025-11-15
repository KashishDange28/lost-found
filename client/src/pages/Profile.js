import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { UserCircleIcon } from '@heroicons/react/24/solid';

const Profile = () => {
  const { user, updateUser } = useAuth(); // Now updateUser exists
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    branch: '',
    year: '',
    enrollmentNo: ''
  });
  const [profileImage, setProfileImage] = useState(null); // For the new file
  const [imagePreview, setImagePreview] = useState(null); // For the preview
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        branch: user.branch || '',
        year: user.year || '',
        enrollmentNo: user.enrollmentNo || ''
      });
      // Set initial image preview from user context
      if (user.profileImageUrl) {
        setImagePreview(`http://localhost:5000/${user.profileImageUrl.replace(/\\/g, '/')}`);
      }
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      // Create a local URL for instant preview
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // --- MUST USE FORMDATA FOR FILE UPLOADS ---
    const data = new FormData();
    data.append('name', formData.name);
    data.append('phone', formData.phone);
    data.append('branch', formData.branch);
    data.append('year', formData.year);
    data.append('enrollmentNo', formData.enrollmentNo);
    
    if (profileImage) {
      data.append('profileImage', profileImage); // Must match 'upload.single('profileImage')'
    }
    // ------------------------------------------

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(
        'http://localhost:5000/api/users/profile',
        data, // <-- Send FormData
        {
          headers: {
            'Authorization': `Bearer ${token}`
            // Don't set Content-Type, axios does it automatically
          }
        }
      );
      
      updateUser(response.data.user); // Update context and localStorage
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-700 mb-4">Please log in to view your profile</h2>
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow overflow-hidden rounded-lg">
          <div className="px-4 py-5 sm:px-6 bg-gradient-to-r from-blue-600 to-purple-600">
            <h3 className="text-lg leading-6 font-medium text-white">
              Profile Information
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-blue-100">
              Update your personal information and preferences.
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="px-4 py-5 sm:p-6">
            {error && (
              <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
                {/* ... Error content ... */}
              </div>
            )}
            
            {success && (
              <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-4">
                {/* ... Success content ... */}
              </div>
            )}

            {/* --- NEW PROFILE IMAGE SECTION --- */}
            <div className="sm:col-span-6 mb-6">
              <label className="block text-sm font-medium text-gray-700">
                Profile Photo
              </label>
              <div className="mt-2 flex items-center space-x-4">
                <span className="h-24 w-24 rounded-full overflow-hidden bg-gray-100">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <UserCircleIcon className="h-full w-full text-gray-300" />
                  )}
                </span>
                <label
                  htmlFor="profile-image-upload"
                  className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <span>Change</span>
                  <input id="profile-image-upload" name="profileImage" type="file" onChange={handleFileChange} className="sr-only" />
                </label>
              </div>
            </div>
            {/* ------------------------------- */}


            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-3">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full name
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div className="sm:col-span-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  disabled
                  className="mt-1 block w-full border border-gray-300 bg-gray-100 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  Phone number
                </label>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="+91 1234567890"
                />
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="branch" className="block text-sm font-medium text-gray-700">
                  Branch
                </label>
                <select
                  id="branch"
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 bg-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Select branch</option>
                  <option value="CSE">Computer Engineering</option>
                  <option value="CSD">Computer Science and Desig Engineering</option>
                  <option value="IT">Information Technology</option>
                  <option value="ENTC">Electronics & Telecommunication</option>
                  <option value="MECH">Mechanical Engineering</option>
                  <option value="CIVIL">Civil Engineering</option>
                  <option value="AUTO">Robotics and Automation Engineering</option>
                  <option value="E&TC">Electronics Engineering</option>
                  <option value="CHEM">Chemical Engineering</option>
                  <option value="AI&DS">Artificial Intelligence and Data ScienceEngineering</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="year" className="block text-sm font-medium text-gray-700">
                  Academic Year
                </label>
                <select
                  id="year"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 bg-white rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="">Select year</option>
                  <option value="FE">First Year (FE)</option>
                  <option value="SE">Second Year (SE)</option>
                  <option value="TE">Third Year (TE)</option>
                  <option value="BE">Final Year (BE)</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <label htmlFor="enrollmentNo" className="block text-sm font-medium text-gray-700">
                  Enrollment Number
                </label>
                <input
                  type="text"
                  name="enrollmentNo"
                  id="enrollmentNo"
                  value={formData.enrollmentNo}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="e.g., S37231***"
                />
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;