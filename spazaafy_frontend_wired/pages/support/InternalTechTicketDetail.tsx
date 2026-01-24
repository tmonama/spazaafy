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
  const authToken = sessionStorage.getItem('access') || localStorage.getItem('access') || '';

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
      } catch {
        // ignore transient polling errors
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [ticketId, authToken]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const isMyMessage = (msg: TechMessage) => {
    if (user?.id == null) return false;
    return String(msg.sender) === String(user.id);
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
    <div className="p-4 sm:p-8 bg-gray-50 dark:bg-gray-900">
      <div className="mb-6">
        <Link
          to={backLink}
          className="flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Support
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: Chat */}
        <div className="lg:col-span-2 flex flex-col min-h-0">
            <Card className="bg-white dark:bg-dark-surface rounded-lg shadow-md overflow-hidden flex flex-col flex-1 min-h-0">
                {/* Header */}
                <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800">
                <div>
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white">{ticket.title}</h2>
                    <p className="text-xs text-gray-500">Ref: #{String(ticket.id).slice(0, 8)}</p>
                </div>

                <span
                    className={`px-3 py-1 text-xs font-bold uppercase rounded-full ${
                    ticket.status === 'RESOLVED'
                        ? 'bg-green-100 text-green-800'
                        : ticket.status === 'FIXING'
                        ? 'bg-blue-100 text-blue-800'
                        : ticket.status === 'INVESTIGATING'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                >
                    {ticket.status}
                </span>
                </div>

                {/* Messages (ONLY scrollable section) */}
                <div className="flex-1 min-h-0 p-4 overflow-y-auto bg-gray-50/50 dark:bg-gray-900/30 space-y-4">
                {messages.length === 0 && (
                    <div className="text-center text-gray-400 text-sm italic mt-10">
                    No messages yet. Start the conversation.
                    </div>
                )}

                {messages.map((msg) => {
                    const isMe = isMyMessage(msg);

                    // Incoming (not me) = LEFT + GREY
                    // Outgoing (me) = RIGHT + GREEN
                    const alignClass = isMe ? 'justify-end' : 'justify-start';
                    const bubbleClass = isMe
                    ? 'bg-green-600 text-white rounded-tr-none'
                    : 'bg-gray-200 text-gray-900 rounded-tl-none';

                    return (
                    <div key={msg.id} className={`flex ${alignClass}`}>
                        <div className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-3 shadow-sm ${bubbleClass}`}>
                        {!isMe && (
                            <div className="text-[10px] font-bold opacity-70 mb-1 text-left">
                            {msg.sender_name}
                            <span className="font-normal opacity-50"> • {msg.sender_role}</span>
                            </div>
                        )}

                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>

                        {msg.attachment && (
                            <a
                            href={msg.attachment}
                            target="_blank"
                            rel="noreferrer"
                            className={`mt-2 flex items-center p-2 rounded-lg text-xs transition-colors ${
                                isMe ? 'bg-green-700 hover:bg-green-800' : 'bg-white/70 hover:bg-white'
                            }`}
                            >
                            <Paperclip className="w-3 h-3 mr-2" />
                            View Attachment
                            </a>
                        )}

                        <div
                            className={`text-[10px] mt-1 ${
                            isMe ? 'text-green-100 text-right' : 'text-gray-600 text-left'
                            }`}
                        >
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        </div>
                    </div>
                    );
                })}

                <div ref={messagesEndRef} />
                </div>

                {/* Input (fixed at bottom) */}
                <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800">
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
                                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                handleSendMessage(e as any);
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

      </div>
    </div>
  );
};

export default InternalTechTicketDetail;
