import React, { useState } from 'react';
import { Save, Shield, Bell, Globe, Database } from 'lucide-react';

const Settings = () => {
  const [settings, setSettings] = useState({
    siteName: 'My Admin Panel',
    maintenanceMode: false,
    userRegistration: true,
    notifyOnNewTicket: true,
    backupInterval: 'daily'
  });

  const handleSave = () => {
    // axios.post('/api/settings/update', settings)...
    alert("Settings saved successfully!");
  };

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">System Settings</h1>

      <div className="space-y-6">
        {/* General Settings */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center gap-2 mb-4 text-blue-600 font-semibold border-b pb-2">
            <Globe size={20} /> General Configuration
          </div>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Site Title</label>
              <input 
                type="text" 
                className="mt-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                value={settings.siteName}
                onChange={(e) => setSettings({...settings, siteName: e.target.value})}
              />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">Maintenance Mode</p>
                <p className="text-xs text-gray-500">Disable the frontend for regular users</p>
              </div>
              <input 
                type="checkbox" 
                className="w-5 h-5 accent-blue-600"
                checked={settings.maintenanceMode}
                onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})}
              />
            </div>
          </div>
        </div>

        {/* Security & Access */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center gap-2 mb-4 text-purple-600 font-semibold border-b pb-2">
            <Shield size={20} /> Security & Access
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">New User Registration</p>
              <p className="text-xs text-gray-500">Allow new users to create accounts</p>
            </div>
            <input 
              type="checkbox" 
              className="w-5 h-5 accent-purple-600"
              checked={settings.userRegistration}
              onChange={(e) => setSettings({...settings, userRegistration: e.target.checked})}
            />
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white p-6 rounded-xl shadow-sm border">
          <div className="flex items-center gap-2 mb-4 text-orange-600 font-semibold border-b pb-2">
            <Bell size={20} /> Notifications
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">Support Ticket Alerts</p>
              <p className="text-xs text-gray-500">Receive email alerts for new user requests</p>
            </div>
            <input 
              type="checkbox" 
              className="w-5 h-5 accent-orange-600"
              checked={settings.notifyOnNewTicket}
              onChange={(e) => setSettings({...settings, notifyOnNewTicket: e.target.checked})}
            />
          </div>
        </div>

        <button 
          onClick={handleSave}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-blue-700 transition shadow-lg shadow-blue-200"
        >
          <Save size={20} /> Save Changes
        </button>
      </div>
    </div>
  );
};

export default Settings;