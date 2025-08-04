import React, { useState } from 'react';
import axios from 'axios';
import { 
  MagnifyingGlassIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

const TestMatching = () => {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState([]);
  const [totalReports, setTotalReports] = useState(0);

  const testMatching = async () => {
    try {
      setLoading(true);
      setResult('Testing matching...');
      
      const response = await axios.get('http://localhost:5000/api/reports/test/direct-matching', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        setMatches(response.data.matches || []);
        setTotalReports(response.data.totalReports);
        setResult(`Test completed! Found ${response.data.matches.length} matches from ${response.data.totalReports} total reports.`);
      } else {
        setResult('Test failed: ' + response.data.message);
      }
    } catch (error) {
      console.error('Test error:', error);
      setResult('Test failed: ' + (error.response?.data?.message || error.message));
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-6">
              <MagnifyingGlassIcon className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Database Matching Test</h1>
            <p className="text-lg text-gray-600">
              Test the matching algorithm directly against the database to see all potential matches.
            </p>
          </div>
          
          <div className="text-center mb-8">
            <button
              onClick={testMatching}
              disabled={loading}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium flex items-center space-x-2 mx-auto"
            >
              <MagnifyingGlassIcon className="h-5 w-5" />
              <span>{loading ? 'Testing...' : 'Test Database Matching'}</span>
            </button>
          </div>
          
          {result && (
            <div className="mb-8 p-4 bg-gray-100 rounded-lg">
              <p className="text-gray-800 font-medium">{result}</p>
            </div>
          )}

          {/* Results */}
          {matches.length > 0 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Found Matches</h2>
                <p className="text-gray-600">
                  {matches.length} potential matches found from {totalReports} total reports
                </p>
              </div>

              {matches.map((match, index) => {
                const LostIcon = getTypeIcon('lost');
                const FoundIcon = getTypeIcon('found');
                
                return (
                  <div key={index} className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">Match #{index + 1}</h3>
                      <div className="text-sm text-gray-600">
                        {match.commonKeywords.length} matching keywords
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Lost Item */}
                      <div className="bg-white rounded-lg p-4 border border-red-200">
                        <div className="flex items-center space-x-2 mb-3">
                          <LostIcon className="h-5 w-5 text-red-500" />
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor('lost')}`}>
                            LOST
                          </span>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2">{match.report1.item}</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div><strong>User:</strong> {match.report1.user}</div>
                          <div><strong>Email:</strong> {match.report1.email}</div>
                        </div>
                      </div>

                      {/* Found Item */}
                      <div className="bg-white rounded-lg p-4 border border-green-200">
                        <div className="flex items-center space-x-2 mb-3">
                          <FoundIcon className="h-5 w-5 text-green-500" />
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getTypeColor('found')}`}>
                            FOUND
                          </span>
                        </div>
                        <h4 className="font-semibold text-gray-900 mb-2">{match.report2.item}</h4>
                        <div className="text-sm text-gray-600 space-y-1">
                          <div><strong>User:</strong> {match.report2.user}</div>
                          <div><strong>Email:</strong> {match.report2.email}</div>
                        </div>
                      </div>
                    </div>

                    {/* Matching Keywords */}
                    <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                      <div className="text-sm font-medium text-blue-900 mb-2">Matching Keywords:</div>
                      <div className="flex flex-wrap gap-2">
                        {match.commonKeywords.map((keyword, idx) => (
                          <span key={idx} className="px-2 py-1 bg-blue-200 text-blue-800 rounded text-xs font-medium">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-8 p-6 bg-gray-50 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Instructions:</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-600">
              <li>Click "Test Database Matching" to scan all reports in the database</li>
              <li>Check your server console for detailed matching logs</li>
              <li>Look for reports in the database and matching results</li>
              <li>Verify if the search criteria is working correctly</li>
              <li>Check if notifications are being triggered for matches</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestMatching; 