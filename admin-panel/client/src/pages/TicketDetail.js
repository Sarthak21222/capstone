// client/src/pages/TicketDetail.js
import React, { useState } from 'react';
import { Send, CheckCircle2, ArrowLeft } from 'lucide-react';

const TicketDetail = ({ ticket, onBack, onResolve }) => {
  const [reply, setReply] = useState('');

  return (
    <div className="bg-white rounded-xl shadow-lg h-[600px] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b flex justify-between items-center bg-gray-50">
        <button onClick={onBack} className="flex items-center text-blue-600 gap-2">
          <ArrowLeft size={18}/> Back to Tickets
        </button>
        <div className="text-right">
          <p className="font-bold text-sm">Ticket ID: {ticket.ticket_id}</p>
          <p className="text-xs text-gray-500">{ticket.user_email}</p>
        </div>
      </div>

      {/* Message Area */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-gray-50">
        <div className="bg-white p-4 rounded-lg shadow-sm max-w-[80%]">
          <p className="text-xs font-bold text-blue-600 mb-1 text-uppercase">User Message</p>
          <p className="text-gray-800">{ticket.message}</p>
          <p className="text-[10px] text-gray-400 mt-2">{ticket.date_time}</p>
        </div>
        {/* Admin replies would map here */}
      </div>

      {/* Reply Input */}
      <div className="p-4 border-t bg-white">
        <div className="flex gap-2">
          <input 
            className="flex-1 border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
            placeholder="Type your reply here..."
            value={reply}
            onChange={(e) => setReply(e.target.value)}
          />
          <button className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700">
            <Send size={20} />
          </button>
          <button 
            onClick={() => onResolve(ticket.ticket_id)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <CheckCircle2 size={18}/> Close Ticket
          </button>
        </div>
      </div>
    </div>
  );
};
export default TicketDetail;