import React, { useEffect, useState } from 'react';
import axios from 'axios';

const MatchedReports = () => {
  const [matchedReports, setMatchedReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMatched = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/reports', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const matchedReports = response.data.reports.filter(report => 
          report.status === 'matched'
        );
        setMatchedReports(matchedReports);
      } catch (err) {
        setError('Failed to fetch matched reports');
      } finally {
        setLoading(false);
      }
    };
    fetchMatched();
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative bg-gradient-to-br from-green-100 to-blue-100 py-12">
      <div className="max-w-3xl w-full mx-auto rounded-3xl shadow-2xl bg-white/30 backdrop-blur-2xl p-10 border border-white/40 card-3d">
        <h1 className="text-4xl font-extrabold text-blue-900 mb-6 font-serif tracking-tight drop-shadow-lg text-center">Matched Reports</h1>
        <p className="text-blue-900/80 text-center mb-8">Here are your lost/found reports that have been matched. Contact the other user to claim or return the item!</p>
        {loading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
        ) : matchedReports.length === 0 ? (
          <div className="text-gray-600 text-center">No matched reports yet.</div>
        ) : (
          <div className="space-y-8">
            {matchedReports.map((report) => (
              <div key={report._id} className="bg-white/80 p-6 rounded-xl shadow card-3d border border-white/40 flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-blue-800 mb-2">Your Report</h2>
                  <div className="mb-1"><span className="font-semibold">Type:</span> {report.type}</div>
                  <div className="mb-1"><span className="font-semibold">Item:</span> {report.item.name}</div>
                  <div className="mb-1"><span className="font-semibold">Description:</span> {report.item.description}</div>
                  <div className="mb-1"><span className="font-semibold">Location:</span> {report.location}</div>
                </div>
                {report.matchedWith && (
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-green-800 mb-2">Matched Report</h2>
                    <div className="mb-1"><span className="font-semibold">Type:</span> {report.type === 'lost' ? 'found' : 'lost'}</div>
                    <div className="mb-1"><span className="font-semibold">Item:</span> {report.matchedWith.item?.name}</div>
                    <div className="mb-1"><span className="font-semibold">Description:</span> {report.matchedWith.item?.description}</div>
                    <div className="mb-1"><span className="font-semibold">Location:</span> {report.matchedWith.location}</div>
                    <div className="mb-1"><span className="font-semibold">Contact Info:</span> {report.matchedWith.contactInfo || 'N/A'}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MatchedReports; 