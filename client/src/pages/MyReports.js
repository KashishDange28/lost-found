import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MyReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('lost');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          'http://localhost:5000/api/reports',
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        setReports(response.data.reports);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch reports');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const lostReports = reports.filter(report => report.type === 'lost');
  const foundReports = reports.filter(report => report.type === 'found');

  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center relative bg-gradient-to-br from-blue-100 to-purple-100 py-12"
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-white/60 z-0" />
      <div className="relative z-10 w-full flex flex-col items-center justify-center py-10">
        <div className="max-w-3xl w-full mx-auto rounded-3xl shadow-2xl bg-white/80 backdrop-blur-2xl p-10 border border-white/40 card-3d">
          {/* Summary Stats */}
          <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-center bg-red-100 rounded-xl px-4 py-2 shadow">
                <span className="text-2xl font-bold text-red-600">{lostReports.length}</span>
                <span className="text-xs text-red-700">Lost</span>
              </div>
              <div className="flex flex-col items-center bg-green-100 rounded-xl px-4 py-2 shadow">
                <span className="text-2xl font-bold text-green-600">{foundReports.length}</span>
                <span className="text-xs text-green-700">Found</span>
              </div>
            </div>
            <div className="flex gap-2 mt-2 md:mt-0">
              <button
                className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${activeTab === 'lost' ? 'bg-red-500 text-white' : 'bg-red-100 text-red-700'}`}
                onClick={() => setActiveTab('lost')}
              >
                Lost Items
              </button>
              <button
                className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200 ${activeTab === 'found' ? 'bg-green-500 text-white' : 'bg-green-100 text-green-700'}`}
                onClick={() => setActiveTab('found')}
              >
                Found Items
              </button>
            </div>
          </div>
          {/* Tab Content */}
          {loading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 animate-fade-in">{error}</div>
          ) : (
            <div>
              {activeTab === 'lost' ? (
                lostReports.length === 0 ? (
                  <p className="text-gray-500 text-center">No lost items reported yet</p>
                ) : (
                  <div className="space-y-4">
                    {lostReports.map((report) => (
                      <div key={report._id} className="bg-white/90 p-6 rounded-xl shadow card-3d border border-white/40 flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-1 text-gray-800 flex items-center gap-2">
                            <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728l1.5-1.5m-1.5-1.5l-1.5-1.5" />
                            </svg>
                            {report.item.name}
                          </h3>
                          <p className="text-gray-600 mb-1">{report.item.description}</p>
                          <p className="text-gray-600 mb-1">Last seen at: {report.location}</p>
                          <p className="text-sm text-gray-500 mb-1">Reported on: {new Date(report.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                foundReports.length === 0 ? (
                  <p className="text-gray-500 text-center">No found items reported yet</p>
                ) : (
                  <div className="space-y-4">
                    {foundReports.map((report) => (
                      <div key={report._id} className="bg-white/90 p-6 rounded-xl shadow card-3d border border-white/40 flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-1 text-gray-800 flex items-center gap-2">
                            <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            {report.item.name}
                          </h3>
                          <p className="text-gray-600 mb-1">{report.item.description}</p>
                          <p className="text-gray-600 mb-1">Found at: {report.location}</p>
                          <p className="text-gray-600 mb-1">Contact: {report.contactInfo}</p>
                          <p className="text-sm text-gray-500 mb-1">Reported on: {new Date(report.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyReports;
