import React, { useState } from 'react';
import axios from 'axios';

const Login = ({ setAuth }) => {
  const [creds, setCreds] = useState({ email: '', password: '' });

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // 1. Send login request to backend
      const res = await axios.post('http://localhost:5000/api/auth/login', creds);
      
      if (res.data.success) {
        // 2. Set authentication status
        localStorage.setItem('isLoggedIn', 'true');
        
        // 3. UPDATED: Store the real database values returned from the backend
        // We use res.data.admin.full_name and res.data.admin.email from your DB
        localStorage.setItem('adminName', res.data.admin.full_name); 
        localStorage.setItem('adminEmail', res.data.admin.email);
        
        setAuth(true);
      }
    } catch (err) { 
      console.error("Login Error:", err.response?.data || err.message);
      alert("Access Denied: Check your email and password."); 
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-slate-900">
      <form onSubmit={handleLogin} className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md">
        <h2 className="text-3xl font-black text-center mb-8 text-slate-800">ADMIN LOGIN</h2>
        
        <div className="space-y-4">
          <input 
            type="email" 
            placeholder="Email (e.g., admin@panel.com)" 
            className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" 
            onChange={e => setCreds({...creds, email: e.target.value})} 
            value={creds.email}
            required
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" 
            onChange={e => setCreds({...creds, password: e.target.value})} 
            value={creds.password}
            required
          />
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold mt-8 hover:bg-blue-700 transition-all shadow-lg">
          Sign In
        </button>
      </form>
    </div>
  );
};

export default Login;