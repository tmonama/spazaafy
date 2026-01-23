import React, { useEffect, useState } from 'react';
import { techApi } from '../../api/techApi';
import { 
  Search, Filter, ChevronRight, CheckCircle, Clock 
} from 'lucide-react';

const TechTickets: React.FC = () => {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  // ✅ Retrieve token from storage
  const token = sessionStorage.getItem('access') || localStorage.getItem('access') || '';

  const fetchTickets = async () => {
    try {
      if(token) {
        setLoading(true);
        const data = await techApi.getTickets(token);
        setTickets(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [token]);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    if (!token) return;
    try {
      // Optimistic update
      setTickets(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
      await techApi.updateTicket(id, { status: newStatus }, token);
    } catch (error) {
      console.error("Update failed", error);
      fetchTickets(); // Revert on fail
    }
  };

  const filteredTickets = tickets.filter(t => filter === 'ALL' || t.status === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-gray-100 text-gray-800';
      case 'INVESTIGATING': return 'bg-yellow-100 text-yellow-800';
      case 'FIXING': return 'bg-blue-100 text-blue-800';
      case 'RESOLVED': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryBadge = (cat: string) => {
      switch (cat) {
          case 'BUG': return <span className="px-2 py-1 rounded text-xs font-bold bg-red-100 text-red-800">BUG</span>;
          case 'IT_SUPPORT': return <span className="px-2 py-1 rounded text-xs font-bold bg-blue-100 text-blue-800">IT SUPPORT</span>;
          case 'ACCESS': return <span className="px-2 py-1 rounded text-xs font-bold bg-purple-100 text-purple-800">ACCESS</span>;
          case 'REFERRAL': return <span className="px-2 py-1 rounded text-xs font-bold bg-orange-100 text-orange-800">REFERRAL</span>;
          default: return null;
      }
  }

  return (
    <div className="p-8 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ticket Management</h1>
        <button onClick={fetchTickets} className="text-sm text-blue-600 hover:underline">Refresh</button>
      </div>

      {/* Filters */}
      <div className="flex space-x-2 mb-6">
        {['ALL', 'PENDING', 'INVESTIGATING', 'FIXING', 'RESOLVED'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-colors ${
              filter === f 
                ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' 
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300'
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading tickets...</div>
        ) : filteredTickets.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No tickets found in this view.</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
              <tr>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Issue</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Requester</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Category</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase">Status</th>
                <th className="p-4 text-xs font-bold text-gray-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredTickets.map(ticket => (
                <tr key={ticket.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-gray-900 dark:text-white">{ticket.title}</div>
                    <div className="text-sm text-gray-500 line-clamp-1">{ticket.description}</div>
                  </td>
                  <td className="p-4 text-sm text-gray-600 dark:text-gray-300">
                    <div>{ticket.requester_name}</div>
                    <div className="text-xs text-gray-400">{ticket.requester_role}</div>
                  </td>
                  <td className="p-4">
                    {getCategoryBadge(ticket.category)}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${getStatusColor(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <select 
                       className="text-xs border rounded p-1 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300"
                       value={ticket.status}
                       onChange={(e) => handleStatusUpdate(ticket.id, e.target.value)}
                    >
                        <option value="PENDING">Pending</option>
                        <option value="INVESTIGATING">Investigating</option>
                        <option value="FIXING">Fixing</option>
                        <option value="RESOLVED">Resolved</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default TechTickets;