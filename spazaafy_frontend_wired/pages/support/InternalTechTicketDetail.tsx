import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Clock, Paperclip, Send, XCircle } from 'lucide-react';
import { techApi } from '../../api/techApi';
import { useAuth } from '../../hooks/useAuth';
import Card from '../../components/Card';
import Button from '../../components/Button';

interface TechMessage {
  id: string;
  sender_name: string;
  sender_role: string;
  sender: string; // sender user id
  content: string;
  created_at: string;
  attachment?: string;
}

const InternalTechTicketDetail: React.FC = () => {
  const { ticketId } = useParams<{ ticketId: string }>();
  const { user } = useAuth();
  const authToken = sessionStorage.getItem('access') || '';

  // Determine portal prefix from URL for proper "Back" link
  const portalPrefix = (() => {
    const first = window.location.pathname.split('/')[1]?.toLowerCase();
    if (['admin', 'hr', 'legal', 'employee'].includes(first)) return first;
    const r = (user?.role || '').toLowerCase();
    if (['admin', 'hr', 'legal', 'employee'].includes(r)) return r;
    return 'admin';
  })();

  const [ticket, setTicket] = useState<any>(null);
  const [messages, setMessages] = useState<TechMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  // Chat Inputs
  const [newMessage, setNewMessage] = useState('');
  const [attachment, setAttachment] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchData = async () => {
    if (!authToken || !ticketId) return;
    try {
      const [tData, mData] = await Promise.all([
        techApi.getTicketById(ticketId, authToken),
        techApi.getMessages(ticketId, authToken),
      ]);
      setTicket(tData);
      setMessages(mData);
    } catch (e) {
      console.error('Error loading internal tech ticket:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketId, authToken]);

  // Poll messages
  useEffect(() => {
    if (!authToken || !ticketId) return;
    const interval = setInterval(async () => {
      try {
        const mData = await techApi.getMessages(ticketId, authToken);
        setMessages(mData);
      } catch (e) {
        // keep quiet
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [ticketId, authToken]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const isMyMessage = (msg: TechMessage) => {
    if (user?.id) return msg.sender === user.id;
    return false;
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !attachment) || !authToken || !ticketId) return;

    setIsSending(true);
    try {
      await techApi.postMessage(
        ticketId,
        { content: newMessage, attachment: attachment || undefined },
        authToken
      );

      setNewMessage('');
      setAttachment(null);
      if (fileInputRef.current) fileInputRef.current.value = '';

      const mData = await techApi.getMessages(ticketId, authToken);
      setMessages(mData);
    } catch (err) {
      console.error(err);
      alert('Failed to send message');
    } finally {
      setIsSending(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading Ticket Data...</div>;
  if (!ticket) return <div className="p-8 text-center text-red-500">Ticket not found or access denied.</div>;

  const backLink = `/${portalPrefix}/support`;

  return (
    <div className="p-4 sm:p-8 min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="mb-6">
        <Link to={backLink} className="flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Support
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Chat */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="flex flex-col h-[600px] shadow-lg border-0 dark:bg-gray-800">
            {/* Header */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800 rounded-t-xl">
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  {ticket.title}
                </h2>
                <p className="text-xs text-gray-500">Ref: #{String(ticket.id).slice(0, 8)}</p>
              </div>

              <span className={`px-3 py-1 text-xs font-bold uppercase rounded-full ${
                ticket.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
                ticket.status === 'FIXING' ? 'bg-blue-100 text-blue-800' :
                ticket.status === 'INVESTIGATING' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {ticket.status}
              </span>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-50/50 dark:bg-gray-900/30 space-y-4">
              {messages.length === 0 && (
                <div className="text-center text-gray-400 text-sm italic mt-10">
                  No messages yet. Start the conversation.
                </div>
              )}

              {messages.map((msg) => {
                const isMe = isMyMessage(msg);

                return (
                  <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-3 shadow-sm ${
                      isMe
                        ? 'bg-green-600 text-white rounded-tr-none'
                        : 'bg-gray-200 text-gray-900 rounded-tl-none'
                    }`}>
                      {!isMe && (
                        <div className="text-[10px] font-bold opacity-70 mb-1">
                          {msg.sender_name} <span className="font-normal opacity-50">• {msg.sender_role}</span>
                        </div>
                      )}

                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>

                      {msg.attachment && (
                        <a
                          href={msg.attachment}
                          target="_blank"
                          rel="noreferrer"
                          className={`mt-2 flex items-center p-2 rounded-lg text-xs transition-colors ${
                            isMe ? 'bg-green-700 hover:bg-green-800' : 'bg-white/60 hover:bg-white'
                          }`}
                        >
                          <Paperclip className="w-3 h-3 mr-2" />
                          View Attachment
                        </a>
                      )}

                      <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-green-100' : 'text-gray-600'}`}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-b-xl">
              {ticket.status === 'RESOLVED' ? (
                <p className="text-center text-sm text-gray-500">
                  This ticket is resolved. If you need more help, ask Tech to re-open it.
                </p>
              ) : (
                <form onSubmit={handleSendMessage}>
                  {attachment && (
                    <div className="mb-2 inline-flex items-center bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-xs">
                      <span className="truncate max-w-[200px]">{attachment.name}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setAttachment(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="ml-2 text-red-500"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <div className="flex items-end gap-2">
                    <div className="flex-1 relative">
                      <textarea
                        className="w-full border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 pr-10 bg-gray-50 dark:bg-gray-900 text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none dark:text-white"
                        placeholder="Type your message..."
                        rows={1}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage(e);
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute right-3 bottom-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <Paperclip className="w-5 h-5" />
                      </button>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={(e) => e.target.files && setAttachment(e.target.files[0])}
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSending || (!newMessage.trim() && !attachment)}
                      className="h-[46px] w-[46px] rounded-xl flex items-center justify-center p-0"
                    >
                      {isSending ? <span className="animate-spin">⌛</span> : <Send className="w-5 h-5" />}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </Card>
        </div>

        {/* RIGHT: Ticket Info */}
        <div className="space-y-6">
          <Card title="Ticket Details">
            <div className="space-y-4 text-sm">
              <div>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Requester</span>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                    {(ticket.requester_name || '?')?.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{ticket.requester_name}</div>
                    <div className="text-xs text-gray-500">{ticket.requester_role}</div>
                  </div>
                </div>
              </div>

              <hr className="border-gray-100 dark:border-gray-700" />

              <div>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Category</span>
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded font-bold">
                  {String(ticket.category || '').replace('_', ' ')}
                </span>
              </div>

              <div>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Created</span>
                <div className="flex items-center text-gray-700 dark:text-gray-300">
                  <Clock className="w-3 h-3 mr-1" />
                  {new Date(ticket.created_at).toLocaleDateString()}
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-2">Original Request</span>
                <div className="text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 text-xs leading-relaxed">
                  {ticket.description}
                </div>
              </div>
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
};

export default InternalTechTicketDetail;
