import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MyReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">My Reports</h1>
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">My Reports</h1>
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  const lostReports = reports.filter(report => report.type === 'lost');
  const foundReports = reports.filter(report => report.type === 'found');

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">My Reports</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Lost Items</h2>
          {lostReports.length === 0 ? (
            <p className="text-gray-500">No lost items reported yet</p>
          ) : (
            <div className="space-y-4">
              {lostReports.map((report) => (
                <div key={report._id} className="bg-gray-50 p-4 rounded">
                  <h3 className="text-lg font-semibold mb-2">{report.item.name}</h3>
                  <p className="text-gray-600">{report.item.description}</p>
                  <p className="text-gray-600">Last seen at: {report.location}</p>
                  <p className="text-sm text-gray-500">
                    Reported on: {new Date(report.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Found Items</h2>
          {foundReports.length === 0 ? (
            <p className="text-gray-500">No found items reported yet</p>
          ) : (
            <div className="space-y-4">
              {foundReports.map((report) => (
                <div key={report._id} className="bg-gray-50 p-4 rounded">
                  <h3 className="text-lg font-semibold mb-2">{report.item.name}</h3>
                  <p className="text-gray-600">{report.item.description}</p>
                  <p className="text-gray-600">Found at: {report.location}</p>
                  <p className="text-gray-600">Contact: {report.contactInfo}</p>
                  <p className="text-sm text-gray-500">
                    Reported on: {new Date(report.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyReports;
