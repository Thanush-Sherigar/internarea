import React, { useEffect, useState } from 'react';
import NavBar from '../components/NavBar';
import Footer from '../components/Footer';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import axios from 'axios';

export default function Profile() {
  const { isLoggedIn, userInfo } = useSelector((state: RootState) => state.user);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoggedIn && userInfo?.email) {
      fetchHistory();
    } else {
      setLoading(false);
    }
  }, [isLoggedIn, userInfo]);

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/auth/history/${userInfo.email}`);
      if (response.data.success) {
        setHistory(response.data.history);
      }
    } catch (error) {
      console.error("Failed to fetch login history", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
        <NavBar />
        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center max-w-md w-full">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-500 mb-6">Please log in to view your profile and login history.</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <NavBar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Sidebar / User Info */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 text-center">
              <img src={userInfo.photo || 'https://ui-avatars.com/api/?name=User'} alt="Profile" className="w-32 h-32 rounded-full mx-auto mb-4 border-4 border-blue-50" />
              <h1 className="text-2xl font-bold text-gray-900">{userInfo.name}</h1>
              <p className="text-gray-500 text-sm mt-1 mb-4">{userInfo.email}</p>
              <div className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-green-500"></span> Active Account
              </div>
            </div>
          </div>

          {/* Main Content / History Table */}
          <div className="md:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold">Login History Audit Log</h2>
                  <p className="text-blue-100 text-sm mt-1">Detailed tracking of all your access environments.</p>
                </div>
                <div className="bg-blue-500 p-3 rounded-lg">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                </div>
              </div>

              <div className="p-0 overflow-x-auto">
                {loading ? (
                  <div className="p-8 text-center text-gray-500">Loading history...</div>
                ) : history.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">No login history found.</div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date & Time</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Device Type</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">OS / Browser</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">IP Address</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {history.map((record, index) => (
                        <tr key={index} className="hover:bg-gray-50 transition">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{new Date(record.timestamp).toLocaleDateString()}</div>
                            <div className="text-sm text-gray-500">{new Date(record.timestamp).toLocaleTimeString()}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              record.deviceType === 'mobile' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {record.deviceType ? record.deviceType.toUpperCase() : 'DESKTOP'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{record.os || 'Unknown OS'}</div>
                            <div className="text-sm text-gray-500">{record.browser || 'Unknown Browser'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                            {record.ip || 'Unknown'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
