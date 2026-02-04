import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, ChevronLeft, ChevronRight, Loader2, DollarSign, Users, Hash, Calendar } from 'lucide-react';

const Subscriptions = () => {
  const [subs, setSubs] = useState([]);
  const [stats, setStats] = useState({ premiumCount: 0, revenue: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => { fetchStats(); }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchSubscriptions();
    }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [currentPage, searchTerm]);

  const fetchStats = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/stats/summary');
      setStats(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      // We send the search term here. The backend will now check both Name and Email.
      const res = await axios.get(`http://localhost:5000/api/subscriptions?page=${currentPage}&search=${searchTerm}`);
      setSubs(res.data.subscriptions || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) { 
      console.error(err); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans text-gray-800">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Subscription Management</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-blue-600 p-8 rounded-[2rem] text-white shadow-xl flex items-center justify-between">
          <div>
            <p className="opacity-80 font-medium">Active Premium Plans</p>
            <h2 className="text-5xl font-black mt-2">{stats.premiumCount}</h2>
          </div>
          <Users size={48} className="opacity-20" />
        </div>
        <div className="bg-emerald-500 p-8 rounded-[2rem] text-white shadow-xl flex items-center justify-between">
          <div>
            <p className="opacity-80 font-medium">Total Recurring Revenue</p>
            <h2 className="text-5xl font-black mt-2">${stats.revenue}</h2>
          </div>
          <DollarSign size={48} className="opacity-20" />
        </div>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-4 top-4 text-gray-400" size={20} />
        <input 
          type="text" 
          placeholder="Search by name or email address..." 
          className="w-full pl-12 pr-4 py-4 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all"
          value={searchTerm} 
          onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
        />
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-widest">
            <tr>
              <th className="px-8 py-5">Subscriber</th>
              <th className="px-8 py-5">Transaction ID</th>
              <th className="px-8 py-5">Purchase Date</th>
              <th className="px-8 py-5 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" className="text-center py-20"><Loader2 className="animate-spin mx-auto text-blue-500" /></td></tr>
            ) : subs.length > 0 ? (
              subs.map((sub) => (
                <tr key={sub.user_id} className="hover:bg-gray-50 border-b last:border-none transition-colors">
                  <td className="px-8 py-5">
                    <div className="font-bold text-gray-800">{sub.name}</div>
                    <div className="text-sm text-gray-400">{sub.email}</div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2 text-sm font-mono text-purple-600 bg-purple-50 px-3 py-1 rounded-lg border border-purple-100 w-fit">
                      <Hash size={14} /> {sub.transaction_id || 'N/A'}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-gray-400" />
                      {sub.last_login ? new Date(sub.last_login).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'short', day: 'numeric'
                      }) : 'N/A'}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right font-bold text-gray-700">$19.00</td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="4" className="text-center py-20 text-gray-400 font-medium">No results found for "{searchTerm}"</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-8">
        <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-4 py-2 bg-white border rounded-xl disabled:opacity-30 flex items-center gap-1 font-bold text-gray-600 hover:bg-gray-50 shadow-sm transition-all">
          <ChevronLeft size={16}/> Prev
        </button>
        <span className="font-bold text-gray-500">Page {currentPage} of {totalPages}</span>
        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="px-4 py-2 bg-white border rounded-xl disabled:opacity-30 flex items-center gap-1 font-bold text-gray-600 hover:bg-gray-50 shadow-sm transition-all">
          Next <ChevronRight size={16}/>
        </button>
      </div>
    </div>
  );
};

export default Subscriptions;