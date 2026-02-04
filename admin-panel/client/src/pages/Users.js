import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UserPlus, Edit, Trash2, Search, X, Ban, Unlock, 
  ChevronLeft, ChevronRight, Loader2, Clock, 
  MessageSquare, CreditCard, Cpu 
} from 'lucide-react';
import { toast } from 'react-toastify';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modals
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBanModal, setShowBanModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Data States
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [banDays, setBanDays] = useState(7);
  const [formData, setFormData] = useState({ name: '', email: '', plan: 'basic', password: '' });

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchUsers();
    }, 400);
    return () => clearTimeout(delayDebounceFn);
  }, [currentPage, searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/users?page=${currentPage}&search=${searchTerm}`);
      setUsers(res.data.users || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) { 
      toast.error("Failed to load users");
    } finally { 
      setLoading(false); 
    }
  };

  const fetchUserDetails = async (user) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/users/${user.user_id}/details`);
      setUserDetails(res.data);
      setShowDetailModal(true);
    } catch (err) {
      toast.error("Could not load user details");
    }
  };

  // --- ACTIONS ---
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/users', formData);
      toast.success("User added successfully!");
      setShowAddModal(false);
      setFormData({ name: '', email: '', plan: 'basic', password: '' });
      fetchUsers();
    } catch (err) { 
      toast.error("Failed to add user");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/users/${selectedUser.user_id}`, formData);
      toast.success("User updated successfully");
      setShowEditModal(false);
      fetchUsers();
    } catch (err) { 
      toast.error("Update failed");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(`Are you sure you want to permanently delete user #${id}?`)) {
      try {
        const res = await axios.delete(`http://localhost:5000/api/users/${id}`);
        if (res.data.success) {
          toast.success("User deleted successfully");
          fetchUsers(); 
        } else {
          toast.error(res.data.error || "Delete failed");
        }
      } catch (err) {
        toast.error("Server error during deletion");
      }
    }
  };

  const handleBanSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/users/ban', { 
        email: selectedUser.email, 
        days: banDays 
      });
      toast.warning(`User banned for ${banDays} days`);
      setShowBanModal(false);
      fetchUsers();
    } catch (err) { 
      toast.error("Ban failed");
    }
  };

  const handleUnban = async (id) => {
    try {
      await axios.post(`http://localhost:5000/api/users/unban/${id}`);
      toast.success("User access restored");
      fetchUsers();
    } catch (err) { 
      toast.error("Unban failed");
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans text-gray-800">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <motion.button 
          whileTap={{ scale: 0.95 }} 
          onClick={() => { setFormData({ name: '', email: '', plan: 'basic', password: '' }); setShowAddModal(true); }} 
          className="bg-blue-600 text-white px-5 py-2 rounded-xl flex items-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-200"
        >
          <UserPlus size={18} /> Add User
        </motion.button>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-4 top-4 text-gray-400" size={20} />
        <input 
          type="text" placeholder="Search users by name or email..." 
          className="w-full pl-12 pr-4 py-4 border rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition-all"
          value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
        />
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-widest">
            <tr>
              <th className="px-8 py-5">User</th>
              <th className="px-8 py-5">Plan</th>
              <th className="px-8 py-5">Status</th>
              <th className="px-8 py-5 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="4" className="text-center py-20"><Loader2 className="animate-spin mx-auto text-blue-500" /></td></tr>
            ) : users.map((user) => (
              <tr key={user.user_id} className="hover:bg-gray-50 border-b last:border-none transition-colors cursor-pointer" onClick={() => fetchUserDetails(user)}>
                <td className="px-8 py-5">
                  <div className="font-bold text-gray-800">{user.name} <span className="text-gray-300 font-normal text-xs ml-2">#{user.user_id}</span></div>
                  <div className="text-sm text-gray-400">{user.email}</div>
                </td>
                <td className="px-8 py-5">
                   <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase ${user.plan === 'premium' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>{user.plan}</span>
                </td>
                <td className="px-8 py-5">
                   {user.ban_until && new Date(user.ban_until) > new Date() ? 
                    <span className="text-red-500 bg-red-50 px-2 py-1 rounded-lg text-xs font-bold border border-red-100 italic">Banned until {new Date(user.ban_until).toLocaleDateString()}</span> 
                    : <span className="text-green-500 bg-green-50 px-2 py-1 rounded-lg text-xs font-bold border border-green-100">Active</span>}
                </td>
                <td className="px-8 py-5" onClick={(e) => e.stopPropagation()}>
                  <div className="flex justify-center gap-2">
                    <button onClick={() => { setSelectedUser(user); setFormData(user); setShowEditModal(true); }} className="text-blue-500 p-2 hover:bg-blue-50 rounded-xl" title="Edit"><Edit size={18} /></button>
                    {user.ban_until && new Date(user.ban_until) > new Date() ? (
                      <button onClick={() => handleUnban(user.user_id)} className="text-green-600 p-2 hover:bg-green-50 rounded-xl" title="Unban"><Unlock size={18} /></button>
                    ) : (
                      <button onClick={() => { setSelectedUser(user); setShowBanModal(true); }} className="text-orange-500 p-2 hover:bg-orange-50 rounded-xl" title="Ban"><Ban size={18} /></button>
                    )}
                    <button onClick={() => handleDelete(user.user_id)} className="text-red-400 p-2 hover:bg-red-50 hover:text-red-600 rounded-xl transition-colors" title="Delete User">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-8">
        <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="px-4 py-2 bg-white border rounded-xl disabled:opacity-30 flex items-center gap-1 font-bold text-gray-600 hover:bg-gray-50"><ChevronLeft size={16}/> Prev</button>
        <span className="font-bold text-gray-400">Page {currentPage} of {totalPages}</span>
        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="px-4 py-2 bg-white border rounded-xl disabled:opacity-30 flex items-center gap-1 font-bold text-gray-600 hover:bg-gray-50">Next <ChevronRight size={16}/></button>
      </div>

      {/* USER DETAIL MODAL */}
      <AnimatePresence>
        {showDetailModal && userDetails && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="bg-white rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col">
              <div className="p-8 border-b flex justify-between items-center bg-gray-50">
                <div>
                  <h2 className="text-2xl font-black">{userDetails.user.name}</h2>
                  <p className="text-gray-500 text-sm">{userDetails.user.email} • ID: {userDetails.user.user_id}</p>
                </div>
                <button onClick={() => setShowDetailModal(false)} className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100"><X /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-1 space-y-6">
                  <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
                    <div className="flex items-center gap-3 mb-4 text-blue-600 font-bold"><CreditCard size={20}/> Subscription</div>
                    <p className="text-xs uppercase font-black text-blue-400">Current Plan</p>
                    <p className="text-xl font-bold capitalize mb-4">{userDetails.user.plan}</p>
                    <p className="text-xs uppercase font-black text-blue-400">Transaction ID</p>
                    <p className="font-mono text-sm break-all">{userDetails.user.transaction_id || 'N/A'}</p>
                  </div>

                  <div className="bg-purple-50 p-6 rounded-3xl border border-purple-100">
                    <div className="flex items-center gap-3 mb-4 text-purple-600 font-bold"><Cpu size={20}/> Token Usage</div>
                    {(() => {
                        const limit = userDetails.user.plan === 'premium' ? 100000 : 50000;
                        const percentage = Math.min((userDetails.user.used_tokens / limit) * 100, 100);
                        return (
                          <>
                            <div className="w-full bg-purple-200 h-2 rounded-full mb-2">
                              <div className="bg-purple-600 h-2 rounded-full transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
                            </div>
                            <p className="text-xl font-black">{userDetails.user.used_tokens?.toLocaleString()}</p>
                            <p className="text-xs text-purple-400 font-bold">Limit: {limit.toLocaleString()}</p>
                          </>
                        );
                    })()}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center gap-3 mb-4 text-gray-800 font-bold"><MessageSquare size={20}/> Chat History</div>
                  <div className="space-y-4 h-[400px] overflow-y-auto pr-4 custom-scrollbar">
                    {userDetails.chats.length > 0 ? userDetails.chats.map((chat, i) => (
                      <div key={i} className="space-y-2">
                        <div className="bg-gray-100 p-4 rounded-2xl rounded-tl-none ml-4 text-sm text-gray-700">
                          <span className="font-bold text-[10px] text-gray-400 block mb-1">USER</span>
                          {chat.message}
                        </div>
                        <div className="bg-blue-600 p-4 rounded-2xl rounded-tr-none mr-4 text-sm text-white">
                          <span className="font-bold text-[10px] text-blue-200 block mb-1">AI ASSISTANT</span>
                          {chat.response}
                        </div>
                      </div>
                    )) : <p className="text-center py-20 text-gray-400 italic">No chat history available.</p>}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* BAN MODAL */}
      <AnimatePresence>
        {showBanModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white p-8 rounded-[2.5rem] w-full max-w-sm shadow-2xl border border-orange-100">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-orange-600"><Clock size={32} /></div>
              <h2 className="text-2xl font-black text-center mb-2">Ban Duration</h2>
              <p className="text-center text-gray-500 text-sm mb-6">Restricting: <br/><span className="font-bold text-gray-800">{selectedUser?.email}</span></p>
              <form onSubmit={handleBanSubmit} className="space-y-4">
                <input type="number" min="1" max="365" required className="w-full p-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-orange-500 outline-none text-center text-2xl font-bold" value={banDays} onChange={e => setBanDays(e.target.value)} />
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setShowBanModal(false)} className="flex-1 py-4 bg-gray-100 rounded-2xl font-bold text-gray-500">Cancel</button>
                  <button type="submit" className="flex-1 py-4 bg-orange-600 text-white rounded-2xl font-bold">Confirm Ban</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ADD MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white p-8 rounded-[2.5rem] w-full max-w-md shadow-2xl">
              <h2 className="text-2xl font-bold mb-6">Add New User</h2>
              <form onSubmit={handleAddSubmit} className="space-y-4">
                <input className="w-full p-4 bg-gray-50 rounded-2xl outline-none" placeholder="Full Name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                <input className="w-full p-4 bg-gray-50 rounded-2xl outline-none" type="email" placeholder="Email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                <input className="w-full p-4 bg-gray-50 rounded-2xl outline-none" type="password" placeholder="Password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                <select className="w-full p-4 bg-gray-50 rounded-2xl outline-none" value={formData.plan} onChange={e => setFormData({...formData, plan: e.target.value})}>
                  <option value="basic">Basic Plan</option>
                  <option value="premium">Premium Plan</option>
                </select>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-4 bg-gray-100 rounded-2xl font-bold">Cancel</button>
                  <button type="submit" className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold">Create User</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* EDIT MODAL */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white p-8 rounded-[2.5rem] w-full max-w-md shadow-2xl">
              <h2 className="text-2xl font-bold mb-6">Edit User</h2>
              <form onSubmit={handleUpdate} className="space-y-4">
                <input className="w-full p-4 bg-gray-50 rounded-2xl outline-none" placeholder="Full Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                <input className="w-full p-4 bg-gray-50 rounded-2xl outline-none" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                <select className="w-full p-4 bg-gray-50 rounded-2xl outline-none" value={formData.plan} onChange={e => setFormData({...formData, plan: e.target.value})}>
                  <option value="basic">Basic Plan</option>
                  <option value="premium">Premium Plan</option>
                </select>
                <div className="flex gap-2">
                  <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 py-4 bg-gray-100 rounded-2xl font-bold">Cancel</button>
                  <button type="submit" className="flex-1 py-4 bg-blue-600 text-white rounded-2xl font-bold">Update</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Users;