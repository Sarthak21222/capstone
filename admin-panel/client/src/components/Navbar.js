import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogOut, UserCircle } from 'lucide-react';

const Navbar = ({ setAuth }) => {
  const navigate = useNavigate();
  
  // Fetch the dynamic name from localStorage
  const adminName = localStorage.getItem('adminName') || "Admin"; 

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('adminName');
    localStorage.removeItem('adminEmail');
    setAuth(false);
    navigate('/login');
  };

  return (
    <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-end px-8 gap-6 sticky top-0 z-10">
      {/* Dynamic Welcome Greeting */}
      <Link 
        to="/profile" 
        className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors font-medium"
      >
        <UserCircle size={20} className="text-blue-500" />
        <span className="text-gray-500">Welcome,</span>
        <span className="capitalize font-bold text-gray-800">{adminName}</span>
      </Link>
      
      <div className="h-6 w-[1px] bg-gray-200 mx-2"></div> {/* Optional Divider */}

      <button 
        onClick={handleLogout}
        className="flex items-center gap-2 text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all font-bold text-sm"
      >
        <LogOut size={18} />
        Logout
      </button>
    </div>
  );
};

export default Navbar;