import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Mail, Clock, CheckCircle, AlertCircle, ChevronLeft, ChevronRight, Loader2, UserX, MessageSquare } from 'lucide-react';
import { toast } from 'react-toastify';

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchTickets();
  }, [currentPage]);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:5000/api/tickets?page=${currentPage}`);
      setTickets(res.data.tickets || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      toast.error("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  const closeTicket = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/tickets/close/${id}`);
      toast.success("Ticket marked as resolved");
      fetchTickets();
    } catch (err) {
      toast.error("Failed to update ticket");
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Support Center</h1>
        <p className="text-gray-500">Manage user inquiries and account health</p>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-400 text-xs font-bold uppercase tracking-widest">
            <tr>
              <th className="px-8 py-5">User & Status</th>
              <th className="px-8 py-5">Ticket Details</th>
              <th className="px-8 py-5">Priority</th>
              <th className="px-8 py-5">Status</th>
              <th className="px-8 py-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="5" className="text-center py-20"><Loader2 className="animate-spin mx-auto text-blue-500" /></td></tr>
            ) : tickets.length > 0 ? (
              tickets.map((ticket) => (
                <tr key={ticket.ticket_id} className="border-b last:border-none hover:bg-gray-50 transition-colors">
                  {/* USER INFO & BAN STATUS */}
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <div className="font-bold text-gray-800 flex items-center gap-2">
                        {ticket.name}
                        {ticket.isBanned && (
                          <span className="flex items-center gap-1 bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded-full font-black uppercase">
                            <UserX size={10} /> Banned
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-400">{ticket.user_email}</div>
                    </div>
                  </td>

                  {/* SUBJECT & MESSAGE */}
                  <td className="px-8 py-5">
                    <div className="flex flex-col max-w-xs">
                      <span className="font-semibold text-gray-700 text-sm">{ticket.subject || "No Subject"}</span>
                      <p className="text-xs text-gray-500 truncate italic">"{ticket.message}"</p>
                    </div>
                  </td>

                  {/* PRIORITY TAG */}
                  <td className="px-8 py-5">
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider border ${
                      ticket.priority === 'High' ? 'bg-red-50 text-red-600 border-red-100' : 
                      ticket.priority === 'Medium' ? 'bg-orange-50 text-orange-600 border-orange-100' : 
                      'bg-blue-50 text-blue-600 border-blue-100'
                    }`}>
                      {ticket.priority || 'Low'}
                    </span>
                  </td>

                  {/* TICKET STATUS */}
                  <td className="px-8 py-5">
                    {ticket.status === 'open' ? (
                      <span className="flex items-center gap-1 text-amber-600 font-bold text-xs bg-amber-50 w-fit px-3 py-1 rounded-full border border-amber-100">
                        <Clock size={14} /> Pending
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-emerald-600 font-bold text-xs bg-emerald-50 w-fit px-3 py-1 rounded-full border border-emerald-100">
                        <CheckCircle size={14} /> Resolved
                      </span>
                    )}
                  </td>

                  {/* ACTION BUTTON */}
                  <td className="px-8 py-5 text-right">
                    {ticket.status === 'open' ? (
                      <button 
                        onClick={() => closeTicket(ticket.ticket_id)}
                        className="text-white bg-blue-600 hover:bg-blue-700 font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-md shadow-blue-100"
                      >
                        Mark Resolved
                      </button>
                    ) : (
                      <span className="text-gray-300 text-xs font-medium italic">No actions</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="5" className="text-center py-20 text-gray-400">No support tickets found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex justify-between items-center mt-8">
        <button 
          disabled={currentPage === 1} 
          onClick={() => setCurrentPage(p => p - 1)} 
          className="px-4 py-2 bg-white border rounded-xl disabled:opacity-30 flex items-center gap-1 font-bold text-gray-600 hover:bg-gray-50 shadow-sm transition-all"
        >
          <ChevronLeft size={16}/> Prev
        </button>
        <span className="font-bold text-gray-500 text-sm">Page {currentPage} of {totalPages}</span>
        <button 
          disabled={currentPage === totalPages} 
          onClick={() => setCurrentPage(p => p + 1)} 
          className="px-4 py-2 bg-white border rounded-xl disabled:opacity-30 flex items-center gap-1 font-bold text-gray-600 hover:bg-gray-50 shadow-sm transition-all"
        >
          Next <ChevronRight size={16}/>
        </button>
      </div>
    </div>
  );
};

export default Tickets;