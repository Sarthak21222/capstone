import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Users, CreditCard, PieChart, TrendingUp, Loader2 } from 'lucide-react';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('newUsers');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/reports/analytics');
      setData(res.data);
    } catch (err) { 
      console.error("Analytics Error:", err); 
    } finally { 
      setLoading(false); 
    }
  };

  if (loading) return (
    <div className="flex h-screen items-center justify-center">
      <Loader2 className="animate-spin text-blue-500" size={48} />
    </div>
  );

  const renderActiveChart = () => {
    // GUARD CLAUSE: Prevent crash if data hasn't arrived yet
    if (!data) return <div className="text-center py-20 text-gray-400">Fetching database records...</div>;

    switch (activeTab) {
      case 'newUsers':
        return (
          <div className="h-[400px] w-full">
            <h3 className="text-xl font-bold mb-4">New User Growth (Last 7 Logins)</h3>
            <ResponsiveContainer>
              <LineChart data={data.userGrowth || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={3} dot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      case 'subs':
        return (
          <div className="h-[400px] w-full">
            <h3 className="text-xl font-bold mb-4">Users who bought Subscriptions</h3>
            <ResponsiveContainer>
              <BarChart data={(data.planDist || []).filter(p => p.plan === 'premium')}>
                <XAxis dataKey="plan" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      case 'plans':
        return (
          <div className="h-[400px] w-full">
            <h3 className="text-xl font-bold mb-4">Plan-wise Comparison</h3>
            <ResponsiveContainer>
              <BarChart data={data.planDist || []}>
                <XAxis dataKey="plan" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" radius={[10, 10, 0, 0]}>
                  {(data.planDist || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.plan === 'premium' ? '#8b5cf6' : '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      case 'revenue':
        return (
          <div className="h-[400px] w-full">
            <h3 className="text-xl font-bold mb-4">Total Revenue Growth</h3>
            <ResponsiveContainer>
              <AreaChart data={data.revenueData || []}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="amount" stroke="#10b981" fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Database Analytics</h1>

      {/* TABS / BUTTONS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <button 
          onClick={() => setActiveTab('newUsers')}
          className={`p-6 rounded-3xl flex flex-col items-center gap-3 transition-all ${activeTab === 'newUsers' ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-gray-500 hover:bg-gray-100'}`}
        >
          <Users /> <span className="font-bold text-sm text-center">New Users</span>
        </button>
        <button 
          onClick={() => setActiveTab('subs')}
          className={`p-6 rounded-3xl flex flex-col items-center gap-3 transition-all ${activeTab === 'subs' ? 'bg-purple-600 text-white shadow-lg' : 'bg-white text-gray-500 hover:bg-gray-100'}`}
        >
          <CreditCard /> <span className="font-bold text-sm text-center">Subscriptions</span>
        </button>
        <button 
          onClick={() => setActiveTab('plans')}
          className={`p-6 rounded-3xl flex flex-col items-center gap-3 transition-all ${activeTab === 'plans' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-gray-500 hover:bg-gray-100'}`}
        >
          <PieChart /> <span className="font-bold text-sm text-center">Plan Comparison</span>
        </button>
        <button 
          onClick={() => setActiveTab('revenue')}
          className={`p-6 rounded-3xl flex flex-col items-center gap-3 transition-all ${activeTab === 'revenue' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white text-gray-500 hover:bg-gray-100'}`}
        >
          <TrendingUp /> <span className="font-bold text-sm text-center">Revenue</span>
        </button>
      </div>

      {/* CHART DISPLAY AREA */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
        {renderActiveChart()}
        
        <div className="mt-8 pt-8 border-t flex gap-8">
          <div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Status</p>
            <p className="text-green-500 font-bold">Data Synced</p>
          </div>
          <div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Update Frequency</p>
            <p className="text-gray-800 font-bold">Real-time</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;