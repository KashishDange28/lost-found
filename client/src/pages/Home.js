import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
      <div className="container mx-auto px-4">
        <h1 className="text-5xl font-bold text-center text-gray-800 mb-12">
          Lost & Found
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Link to="/report-lost" className="card-3d">
            <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <div className="flex items-center justify-center mb-6">
                <div className="rounded-full bg-red-100 p-4">
                  <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728l1.5-1.5m-1.5-1.5l-1.5-1.5" />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Report Lost Item</h2>
              <p className="text-gray-600 text-center">Report an item you've lost</p>
              <div className="mt-4">
                <button className="btn-hover w-full py-2 px-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-300">
                  Report Lost
                </button>
              </div>
            </div>
          </Link>

          <Link to="/report-found" className="card-3d">
            <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <div className="flex items-center justify-center mb-6">
                <div className="rounded-full bg-green-100 p-4">
                  <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Report Found Item</h2>
              <p className="text-gray-600 text-center">Report an item you've found</p>
              <div className="mt-4">
                <button className="btn-hover w-full py-2 px-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-300">
                  Report Found
                </button>
              </div>
            </div>
          </Link>

          <Link to="/my-reports" className="card-3d">
            <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300">
              <div className="flex items-center justify-center mb-6">
                <div className="rounded-full bg-blue-100 p-4">
                  <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">My Reports</h2>
              <p className="text-gray-600 text-center">View your reported items</p>
              <div className="mt-4">
                <button className="btn-hover w-full py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-300">
                  View Reports
                </button>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
