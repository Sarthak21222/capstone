import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MessageCircle, X, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'react-toastify'; // Import toast

const Support = () => {
  const [tickets, setTickets] = useState([]);
  const [activeTab, setActiveTab] = useState('open'); 
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchTickets();
  }, [currentPage, activeTab]);

  const fetchTickets = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/tickets?page=${currentPage}`);
      setTickets(res.data.tickets || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      toast.error("Failed to load tickets from server");
    }
  };

  const handleSendReply = async () => {
    if (!replyText) {
      toast.warning("Please type a message before sending");
      return;
    }
    const id = selectedTicket.ticket_id;
    try {
      await axios.post(`http://localhost:5000/api/tickets/reply/${id}`, { reply: replyText });
      toast.success("Reply sent successfully!"); // Toast instead of Alert
      setReplyText('');
      setShowReplyModal(false);
    } catch (err) {
      toast.error("Failed to send reply. Please try again.");
    }
  };

  const handleCloseTicket = async (id) => {
    try {
      const res = await axios.put(`http://localhost:5000/api/tickets/close/${id}`);
      if (res.data.success) {
        toast.info("Ticket marked as Resolved"); // Toast instead of Alert
        fetchTickets(); 
      }
    } catch (err) {
      toast.error("Could not close ticket");
    }
  };

  const filteredTickets = tickets.filter(t => t.status === activeTab);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Support Center</h1>
        <div className="flex bg-gray-200 p-1 rounded-lg">
          <button 
            onClick={() => { setActiveTab('open'); setCurrentPage(1); }}
            className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'open' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
          >
            Open Tickets
          </button>
          <button 
            onClick={() => { setActiveTab('closed'); setCurrentPage(1); }}
            className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${activeTab === 'closed' ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}
          >
            Closed
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 text-gray-500 text-xs font-bold uppercase">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Subject</th>
              <th className="px-6 py-4">Priority</th>
              <th className="px-6 py-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredTickets.length > 0 ? filteredTickets.map((ticket) => (
              <tr key={ticket.ticket_id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 font-mono text-gray-400 text-xs">#TK-{ticket.ticket_id}</td>
                <td className="px-6 py-4 font-medium text-gray-700">{ticket.user_email}</td>
                <td className="px-6 py-4 text-gray-600">{ticket.subject}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-wider border ${
                    ticket.priority?.toLowerCase() === 'high' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                  }`}>
                    {ticket.priority || 'NORMAL'}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="flex justify-center gap-4">
                    <button onClick={() => { setSelectedTicket(ticket); setShowReplyModal(true); }} className="text-blue-600 font-bold flex items-center gap-1">
                      <MessageCircle size={16} /> Reply
                    </button>
                    {activeTab === 'open' && (
                      <button onClick={() => handleCloseTicket(ticket.ticket_id)} className="text-green-600 font-bold flex items-center gap-1">
                        <CheckCircle size={16} /> Close
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="5" className="text-center py-20 text-gray-400 italic">No tickets found.</td></tr>
            )}
          </tbody>
        </table>

        <div className="p-4 border-t bg-gray-50 flex items-center justify-between">
          <p className="text-xs text-gray-500 font-bold">Page {currentPage} of {totalPages}</p>
          <div className="flex gap-2">
            <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="px-3 py-1.5 bg-white border rounded-lg disabled:opacity-30"><ChevronLeft size={16} /></button>
            <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="px-3 py-1.5 bg-white border rounded-lg disabled:opacity-30"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>

      {/* MODAL remains the same but calls handleSendReply which uses toasts */}
      {showReplyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-6 border-b flex justify-between bg-gray-50">
               <h2 className="font-bold">Reply to {selectedTicket?.user_email}</h2>
               <button onClick={() => setShowReplyModal(false)}><X size={20}/></button>
            </div>
            <div className="p-6">
              <textarea 
                className="w-full h-40 p-4 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Type your message..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              ></textarea>
            </div>
            <div className="p-6 border-t bg-gray-50 flex gap-3">
              <button onClick={handleSendReply} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold shadow-md hover:bg-blue-700">Send Reply</button>
              <button onClick={() => setShowReplyModal(false)} className="flex-1 bg-white text-gray-700 py-3 rounded-xl font-bold border hover:bg-gray-100">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Support;