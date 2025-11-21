import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import { 
  MagnifyingGlassIcon, 
  UserIcon, 
  EnvelopeIcon, 
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const MatchedReports = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await axios.get(`${API_BASE_URL}/api/reports/test/direct-matching`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        setMatches(response.data.matches || []);
      } else {
        setError('Failed to fetch matches');
      }
    } catch (err) {
      console.error('Error fetching matches:', err);
      setError('Failed to fetch matches. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type) => {
    return type === 'lost' ? 'bg-red-100 text-red-800 border-red-200' : 'bg-green-100 text-green-800 border-green-200';
  };

  const getTypeIcon = (type) => {
    return type === 'lost' ? ExclamationTriangleIcon : CheckCircleIcon;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
            <p className="mt-6 text-xl text-gray-700 font-medium">Finding potential matches...</p>
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
                <h3 className="text-lg font-semibold text-red-800">Error Loading Matches</h3>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
            </div>
            <button 
              onClick={fetchMatches}
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
            <MagnifyingGlassIcon className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Matched Reports</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover potential matches between lost and found items. Connect with other users to reunite items with their owners.
          </p>
        </div>

        {matches.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md mx-auto">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <MagnifyingGlassIcon className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">No Matches Found</h3>
              <p className="text-gray-600 mb-6">
                Currently, there are no matching lost and found reports. Create some reports to see potential matches!
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
          <div className="space-y-8">
            {matches.map((match, index) => {
              const LostIcon = getTypeIcon('lost');
              const FoundIcon = getTypeIcon('found');
              
              return (
                <div key={index} className="bg-white rounded-2xl shadow-xl overflow-hidden">
                  {/* Match Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                          <MagnifyingGlassIcon className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">Potential Match Found!</h3>
                          <p className="text-blue-100 text-sm">
                            {match.commonKeywords.length} matching keywords: {match.commonKeywords.join(', ')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white text-sm opacity-90">Match #{index + 1}</div>
                      </div>
                    </div>
                  </div>

                  {/* Match Content */}
                  <div className="p-6">
                    <div className="grid md:grid-cols-2 gap-8">
                      {/* Lost Item */}
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3 mb-4">
                          <LostIcon className="h-6 w-6 text-red-500" />
                          <h4 className="text-lg font-semibold text-gray-900">Lost Item</h4>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor('lost')}`}>
                            LOST
                          </span>
                        </div>
                        
                        <div className="bg-red-50 rounded-xl p-4">
                          <h5 className="font-semibold text-gray-900 mb-2">{match.report1.item}</h5>
                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center space-x-2">
                              <UserIcon className="h-4 w-4" />
                              <span>{match.report1.user}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <EnvelopeIcon className="h-4 w-4" />
                              <span>{match.report1.email}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Found Item */}
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3 mb-4">
                          <FoundIcon className="h-6 w-6 text-green-500" />
                          <h4 className="text-lg font-semibold text-gray-900">Found Item</h4>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getTypeColor('found')}`}>
                            FOUND
                          </span>
                        </div>
                        
                        <div className="bg-green-50 rounded-xl p-4">
                          <h5 className="font-semibold text-gray-900 mb-2">{match.report2.item}</h5>
                          <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex items-center space-x-2">
                              <UserIcon className="h-4 w-4" />
                              <span>{match.report2.user}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <EnvelopeIcon className="h-4 w-4" />
                              <span>{match.report2.email}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-8 flex flex-col sm:flex-row gap-4">
                      <button
                        onClick={() => window.open(`mailto:${match.report1.email}?subject=Regarding your lost item: ${match.report1.item}`, '_blank')}
                        className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center space-x-2"
                      >
                        <EnvelopeIcon className="h-5 w-5" />
                        <span>Contact Lost Item Owner</span>
                      </button>
                      <button
                        onClick={() => window.open(`mailto:${match.report2.email}?subject=Regarding your found item: ${match.report2.item}`, '_blank')}
                        className="flex-1 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center justify-center space-x-2"
                      >
                        <EnvelopeIcon className="h-5 w-5" />
                        <span>Contact Found Item Owner</span>
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
            onClick={fetchMatches}
            className="bg-gray-800 text-white px-8 py-3 rounded-lg hover:bg-gray-900 transition-colors font-medium flex items-center space-x-2 mx-auto"
          >
            <MagnifyingGlassIcon className="h-5 w-5" />
            <span>Refresh Matches</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatchedReports; 