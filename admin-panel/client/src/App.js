import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// --- TOASTIFY IMPORTS ---
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Layout Components
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

// Page Components
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Subscriptions from './pages/Subscriptions';
import Support from './pages/Support';
import Profile from './pages/Profile';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

function App() {
  const [isAuth, setIsAuth] = useState(localStorage.getItem('isLoggedIn') === 'true');

  return (
    <Router>
      {/* --- GLOBAL TOAST CONTAINER --- */}
      <ToastContainer 
        position="top-right" 
        autoClose={3000} 
        hideProgressBar={false} 
        newestOnTop={false} 
        closeOnClick 
        rtl={false} 
        pauseOnFocusLoss 
        draggable 
        pauseOnHover 
        theme="light"
      />

      <Routes>
        <Route 
          path="/login" 
          element={!isAuth ? <Login setAuth={setIsAuth} /> : <Navigate to="/" />} 
        />

        <Route 
          path="/*" 
          element={isAuth ? (
            <div className="flex bg-gray-100 min-h-screen">
              <Sidebar />
              
              <div className="flex-1 ml-64 flex flex-col">
                <Navbar setAuth={setIsAuth} /> 
                
                <div className="p-4 flex-1">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/users" element={<Users />} />
                    <Route path="/subscriptions" element={<Subscriptions />} />
                    <Route path="/support" element={<Support />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="*" element={<Navigate to="/" />} />
                  </Routes>
                </div>
              </div>
            </div>
          ) : (
            <Navigate to="/login" />
          )} 
        />
      </Routes>
    </Router>
  );
}

export default App;