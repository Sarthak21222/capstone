// client/src/pages/ResetPassword.js
import React, { useState } from 'react';
import { Lock, ShieldCheck } from 'lucide-react';

const ResetPassword = () => {
  const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' });

  const handleUpdate = (e) => {
    e.preventDefault();
    if(passwords.new !== passwords.confirm) return alert("Passwords do not match!");
    // axios.put('/api/admin/reset-password', passwords)...
    alert("Password updated successfully!");
  };

  return (
    <div className="p-8 flex justify-center mt-10">
      <div className="bg-white p-8 rounded-xl shadow-sm border w-full max-w-md text-center">
        <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="text-blue-600" size={30} />
        </div>
        <h2 className="text-2xl font-bold mb-2">Security Settings</h2>
        <p className="text-gray-500 mb-8 text-sm">Update your administrator password</p>

        <form onSubmit={handleUpdate} className="space-y-4 text-left">
          <div>
            <label className="text-xs font-semibold text-gray-500">Current Password</label>
            <input type="password" required className="w-full mt-1 p-2 border rounded-lg" 
              onChange={e => setPasswords({...passwords, old: e.target.value})}/>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500">New Password</label>
            <input type="password" required className="w-full mt-1 p-2 border rounded-lg" 
              onChange={e => setPasswords({...passwords, new: e.target.value})}/>
          </div>
          <div>
            <label className="text-xs font-semibold text-gray-500">Confirm New Password</label>
            <input type="password" required className="w-full mt-1 p-2 border rounded-lg" 
              onChange={e => setPasswords({...passwords, confirm: e.target.value})}/>
          </div>
          <button className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold mt-4 hover:bg-blue-700 transition">
            Update Admin Password
          </button>
        </form>
      </div>
    </div>
  );
};
export default ResetPassword;