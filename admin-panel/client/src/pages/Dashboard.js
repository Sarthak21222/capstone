import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, ShieldCheck, DollarSign, Activity, ChevronLeft, ChevronRight } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({ premiumCount: 0, basicCount: 0, revenue: 0 });
  const [activities, setActivities] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchSummary();
  }, []);

  useEffect(() => {
    fetchActivity();
  }, [currentPage]); // Re-fetch when page changes

  const fetchSummary = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/stats/summary');
      setStats(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchActivity = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/stats/activity?page=${currentPage}`);
      setActivities(res.data.logs);
      setTotalPages(res.data.totalPages);
    } catch (err) { console.error(err); }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard Overview</h1>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 font-medium text-sm">Basic Users</p>
              <h2 className="text-3xl font-bold text-gray-800">{stats.basicCount}</h2>
            </div>
            <Users className="text-blue-500 opacity-20" size={40} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 font-medium text-sm">Premium Users</p>
              <h2 className="text-3xl font-bold text-gray-800">{stats.premiumCount}</h2>
            </div>
            <ShieldCheck className="text-purple-500 opacity-20" size={40} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 font-medium text-sm">Total Revenue</p>
              <h2 className="text-3xl font-bold text-green-600">${stats.revenue}</h2>
            </div>
            <DollarSign className="text-green-500 opacity-20" size={40} />
          </div>
        </div>
      </div>

      {/* ACTIVITY TABLE WITH PAGINATION */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity size={20} className="text-blue-500" />
            <h3 className="font-bold text-gray-800">Live Activity Logs</h3>
          </div>
          <div className="flex items-center gap-2">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => prev - 1)}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-30"
            >
              <ChevronLeft size={20} />
            </button>
            <span className="text-sm font-medium text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => prev + 1)}
              className="p-1 rounded hover:bg-gray-100 disabled:opacity-30"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-400 text-xs uppercase font-bold">
            <tr>
              <th className="px-6 py-4">User ID</th>
              <th className="px-6 py-4">Action</th>
              <th className="px-6 py-4">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {activities.length > 0 ? activities.map((log, idx) => (
              <tr key={idx} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-medium text-gray-700">#{log.user_id}</td>
                <td className="px-6 py-4">
                  <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-bold uppercase">
                    {log.action}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500 text-sm">
                  {new Date(log.time).toLocaleString()}
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="3" className="px-6 py-10 text-center text-gray-400">No recent activity</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;