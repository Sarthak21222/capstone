import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  LifeBuoy, 
  Settings, 
  BarChart3 
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path 
    ? "text-blue-400 bg-slate-800" 
    : "text-gray-300 hover:text-blue-400 hover:bg-slate-800/50";

  const menuItems = [
    { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/' },
    { name: 'Users', icon: <Users size={20} />, path: '/users' },
    { name: 'Subscriptions', icon: <CreditCard size={20} />, path: '/subscriptions' },
    { name: 'Reports', icon: <BarChart3 size={20} />, path: '/reports' },
    { name: 'Support', icon: <LifeBuoy size={20} />, path: '/support' },
    { name: 'Settings', icon: <Settings size={20} />, path: '/settings' },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white h-screen fixed flex flex-col p-4 border-r border-slate-800">
      <h2 className="text-2xl font-black mb-10 px-2 text-blue-500 tracking-tighter">ADMIN PRO</h2>
      
      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => (
          <Link 
            key={item.path}
            to={item.path} 
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all font-medium ${isActive(item.path)}`}
          >
            {item.icon}
            {item.name}
          </Link>
        ))}
      </nav>
      
      <div className="p-4 text-xs text-slate-500 border-t border-slate-800">
        © 2026 Admin Pro Panel
      </div>
    </div>
  );
};

export default Sidebar;