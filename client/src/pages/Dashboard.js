import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState({ lost: 0, found: 0, matched: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/reports', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const reports = response.data.reports;
        const lost = reports.filter(r => r.type === 'lost').length;
        const found = reports.filter(r => r.type === 'found').length;
        const matched = reports.filter(r => r.status === 'matched').length;
        setStats({ lost, found, matched });
        setRecent(reports.slice(-5).reverse());
      } catch (err) {
        setError('Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center relative bg-gradient-to-br from-purple-100 to-blue-100 py-12">
      <div className="max-w-4xl w-full mx-auto rounded-3xl shadow-2xl bg-white/80 backdrop-blur-2xl p-10 border border-white/40 card-3d">
        <h1 className="text-4xl font-extrabold text-blue-900 mb-6 font-serif tracking-tight drop-shadow-lg text-center">Dashboard</h1>
        <p className="text-blue-900/80 text-center mb-8">Overview of lost, found, and matched reports, plus recent activity.</p>
        {loading ? (
          <div className="flex justify-center items-center min-h-[200px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="flex flex-col items-center bg-red-100 rounded-2xl p-6 shadow">
                <span className="text-3xl font-bold text-red-600">{stats.lost}</span>
                <span className="text-sm text-red-700">Lost Reports</span>
              </div>
              <div className="flex flex-col items-center bg-green-100 rounded-2xl p-6 shadow">
                <span className="text-3xl font-bold text-green-600">{stats.found}</span>
                <span className="text-sm text-green-700">Found Reports</span>
              </div>
              <div className="flex flex-col items-center bg-blue-100 rounded-2xl p-6 shadow">
                <span className="text-3xl font-bold text-blue-600">{stats.matched}</span>
                <span className="text-sm text-blue-700">Matched</span>
              </div>
            </div>
            {/* Simple Bar Chart */}
            <div className="mb-10">
              <h2 className="text-xl font-bold text-blue-800 mb-4 text-center">Report Distribution</h2>
              <div className="flex items-end justify-center gap-8 h-40">
                <div className="flex flex-col items-center">
                  <div style={{ height: `${stats.lost * 15 || 10}px` }} className="w-10 bg-red-400 rounded-t-xl transition-all duration-500"></div>
                  <span className="mt-2 text-red-700 font-semibold">Lost</span>
                </div>
                <div className="flex flex-col items-center">
                  <div style={{ height: `${stats.found * 15 || 10}px` }} className="w-10 bg-green-400 rounded-t-xl transition-all duration-500"></div>
                  <span className="mt-2 text-green-700 font-semibold">Found</span>
                </div>
                <div className="flex flex-col items-center">
                  <div style={{ height: `${stats.matched * 15 || 10}px` }} className="w-10 bg-blue-400 rounded-t-xl transition-all duration-500"></div>
                  <span className="mt-2 text-blue-700 font-semibold">Matched</span>
                </div>
              </div>
            </div>
            {/* Recent Activity */}
            <div>
              <h2 className="text-xl font-bold text-blue-800 mb-4 text-center">Recent Reports</h2>
              {recent.length === 0 ? (
                <div className="text-gray-600 text-center">No recent reports.</div>
              ) : (
                <div className="space-y-4">
                  {recent.map((report) => (
                    <div key={report._id} className="bg-white/90 p-4 rounded-xl shadow card-3d border border-white/40 flex flex-col md:flex-row gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`font-bold ${report.type === 'lost' ? 'text-red-600' : report.type === 'found' ? 'text-green-600' : 'text-blue-600'}`}>{report.type.charAt(0).toUpperCase() + report.type.slice(1)}</span>
                          {report.status === 'matched' && <span className="ml-2 px-2 py-0.5 bg-blue-200 text-blue-800 rounded-full text-xs font-semibold">Matched</span>}
                        </div>
                        <div className="mb-1"><span className="font-semibold">Item:</span> {report.item.name}</div>
                        <div className="mb-1"><span className="font-semibold">Description:</span> {report.item.description}</div>
                        <div className="mb-1"><span className="font-semibold">Location:</span> {report.location}</div>
                        <div className="mb-1 text-xs text-gray-500">Reported on: {new Date(report.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 