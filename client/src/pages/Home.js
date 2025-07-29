import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center relative bg-cover bg-center"
      style={{
        backgroundImage: `url(${process.env.PUBLIC_URL + '/kkwcolle.jpg'})`,
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-60 z-0" />
      <div className="relative z-10 w-full flex flex-col items-center justify-center py-16">
        <div className="max-w-3xl w-full mx-auto rounded-3xl shadow-2xl bg-white/30 backdrop-blur-2xl p-10 mb-10 border border-white/40 card-3d">
          <h1 className="text-5xl font-extrabold text-center text-white mb-6 font-serif tracking-tight drop-shadow-lg">
            Lost & Found
          </h1>
          <p className="text-lg text-center text-white/90 mb-6 font-medium">
            Welcome to the KKW College Lost & Found Portal. Here you can report lost or found items, and help reunite people with their belongings. Our system is designed to make it easy, fast, and secure to manage lost and found items within the college campus.
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-6">
            <Link to="/report-lost" className="card-3d w-full md:w-1/2">
              <div className="bg-white/80 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 border border-white/40">
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
            <Link to="/report-found" className="card-3d w-full md:w-1/2">
              <div className="bg-white/80 p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 border border-white/40">
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
          </div>
          <div className="text-center mt-6">
            <Link to="/my-reports" className="inline-block card-3d">
              <div className="bg-white/80 p-6 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 border border-white/40">
                <h2 className="text-xl font-bold text-blue-800 mb-1">My Reports</h2>
                <p className="text-gray-600 text-center">View and manage your reported items</p>
                <div className="mt-2">
                  <button className="btn-hover py-2 px-4 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-300">
                    View Reports
                  </button>
                </div>
              </div>
            </Link>
          </div>
        </div>
        <div className="max-w-2xl mx-auto text-center text-white/80 mt-8">
          <h3 className="text-2xl font-bold mb-2">How it works?</h3>
          <p className="mb-2">1. Report a lost or found item using the buttons above.</p>
          <p className="mb-2">2. Our system will notify you if a match is found.</p>
          <p className="mb-2">3. Help others by reporting found items and checking your reports regularly.</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
