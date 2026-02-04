import React, { useState } from 'react';
import axios from 'axios';
import { User, Mail, ShieldCheck, Lock, Save } from 'lucide-react';

const Profile = () => {
  // 1. Get dynamic data from localStorage
  const adminName = localStorage.getItem('adminName') || "Admin";
  const adminEmail = localStorage.getItem('adminEmail') || "admin@panel.com";

  // 2. State for password reset
  const [passwords, setPasswords] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const handleReset = async (e) => {
    e.preventDefault();

    if (passwords.newPassword !== passwords.confirmPassword) {
      return alert("Passwords do not match!");
    }

    try {
      const res = await axios.put('http://localhost:5000/api/admin/reset-password', {
        newPassword: passwords.newPassword
      });

      if (res.data.success) {
        alert("✅ Password updated successfully in the database!");
        setPasswords({ newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Server connection failed";
      alert("❌ Error: " + errorMsg);
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Profile</h1>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT SIDE: Dynamic Admin Info Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden text-center pb-10">
            <div className="bg-blue-600 h-24 mb-12 relative">
              <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 bg-white p-2 rounded-full shadow-lg">
                <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center text-blue-600">
                  <User size={40} />
                </div>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold text-gray-800 capitalize px-4">{adminName}</h2>
            <p className="text-gray-500 mb-6 font-medium">System Administrator</p>
            
            <div className="space-y-3 px-6 text-left">
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                <Mail className="text-blue-500" size={20} />
                <div className="overflow-hidden">
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Email</p>
                  <p className="text-sm font-medium text-gray-700 truncate">{adminEmail}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-2xl border border-gray-100">
                <ShieldCheck className="text-green-500" size={20} />
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase">Status</p>
                  <p className="text-sm font-medium text-gray-700">Verified Admin</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Password Update Form */}
        <div className="lg:col-span-2">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 h-full">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-blue-50 rounded-xl">
                <Lock className="text-blue-600" size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Security Settings</h3>
            </div>

            <form onSubmit={handleReset} className="space-y-5 max-w-md">
              <div>
                <label className="block text-sm font-bold text-gray-500 mb-2 uppercase ml-1">New Password</label>
                <input 
                  type="password"
                  className="w-full p-4 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-gray-50"
                  placeholder="••••••••"
                  value={passwords.newPassword}
                  onChange={(e) => setPasswords({...passwords, newPassword: e.target.value})}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-500 mb-2 uppercase ml-1">Confirm Password</label>
                <input 
                  type="password"
                  className="w-full p-4 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-gray-50"
                  placeholder="••••••••"
                  value={passwords.confirmPassword}
                  onChange={(e) => setPasswords({...passwords, confirmPassword: e.target.value})}
                  required
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 mt-4"
              >
                <Save size={20} /> Update Credentials
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;