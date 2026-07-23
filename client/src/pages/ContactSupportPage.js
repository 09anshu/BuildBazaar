import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Send, MessageSquare, ChevronDown, ChevronUp, Plus, ArrowLeft, CheckCircle, Clock, AlertCircle, BookOpen } from 'lucide-react';

const ContactSupportPage = () => {
  const [tickets, setTickets] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [orders, setOrders] = useState([]);
  const [showNewForm, setShowNewForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [selectedOrder, setSelectedOrder] = useState('');
  const [expandedTicket, setExpandedTicket] = useState(null);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    } else {
      fetchMyTickets();
      fetchFaqs();
      fetchOrders();
    }
  }, [navigate, userInfo]);

  const config = () => ({
    headers: { Authorization: `Bearer ${userInfo?.token}` }
  });

  const fetchMyTickets = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/tickets/my-tickets', config());
      setTickets(res.data);
    } catch (error) {
      toast.error('Error fetching tickets');
    } finally {
      setLoading(false);
    }
  };

  const fetchFaqs = async () => {
    try {
      // Public endpoint
      const res = await axios.get('/api/faqs');
      setFaqs(res.data);
    } catch (error) {
      // ignore
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get('/api/orders/myorders', config());
      setOrders(res.data);
    } catch (error) {
      // ignore
    }
  };

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !description.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    try {
      await axios.post('/api/tickets', { subject, description, orderId: selectedOrder }, config());
      toast.success('Ticket submitted! Our support team will respond soon.');
      setSubject('');
      setDescription('');
      setSelectedOrder('');
      setShowNewForm(false);
      fetchMyTickets();
    } catch (error) {
      toast.error('Error submitting ticket');
    }
  };

  const handleReply = async (ticketId) => {
    if (!replyContent.trim()) return;
    try {
      await axios.post(`/api/tickets/${ticketId}/messages`, { content: replyContent }, config());
      toast.success('Reply sent');
      setReplyContent('');
      fetchMyTickets();
    } catch (error) {
      toast.error('Error sending reply');
    }
  };

  const fetchTicketDetails = async (ticketId) => {
    try {
      const res = await axios.get(`/api/tickets/${ticketId}`, config());
      // Update in local state
      setTickets(prev => prev.map(t => t._id === ticketId ? res.data : t));
    } catch (e) { /* ignore */ }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero */}
      <div className="bg-[#0f1117] text-white py-12">
        <div className="max-w-4xl mx-auto px-6">
          <button onClick={() => navigate(-1)} className="inline-flex items-center text-sm text-gray-400 hover:text-[#f5a623] mb-4 transition-colors">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <MessageSquare className="h-8 w-8 text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Contact Support</h1>
                <p className="text-gray-400 text-sm mt-1">Submit a ticket and we'll get back to you within 24 hours</p>
              </div>
            </div>
            <button
              onClick={() => setShowNewForm(!showNewForm)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2 text-sm"
            >
              <Plus className="h-4 w-4" /> New Ticket
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* FAQs Section */}
        {faqs.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-500" /> Frequently Asked Questions
            </h2>
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
              {faqs.map((faq, index) => (
                <div key={faq._id} className={index !== faqs.length - 1 ? "border-b border-gray-100" : ""}>
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === faq._id ? null : faq._id)}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left font-semibold text-gray-700"
                  >
                    <span>{faq.question}</span>
                    {expandedFaq === faq._id ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                  </button>
                  {expandedFaq === faq._id && (
                    <div className="p-4 bg-gray-50 text-gray-600 text-sm leading-relaxed border-t border-gray-100">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* New Ticket Form */}
        {showNewForm && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-blue-100">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Submit a New Ticket</h2>
            <form onSubmit={handleSubmitTicket} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">Subject</label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., Damaged delivery, Wrong item received..."
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">Related Order (Optional)</label>
                <select
                  value={selectedOrder}
                  onChange={(e) => setSelectedOrder(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                >
                  <option value="">-- Select an Order --</option>
                  {orders.map(order => (
                    <option key={order._id} value={order._id}>
                      Order #{order._id.substring(0, 8)} - ${order.totalPrice} ({new Date(order.createdAt).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600 block mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please describe your issue in detail, including any order IDs if applicable..."
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 h-32 resize-none"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowNewForm(false)} className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg">
                  Cancel
                </button>
                <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-5 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm">
                  <Send className="h-4 w-4" /> Submit Ticket
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tickets List */}
        <h2 className="text-lg font-bold text-gray-800 mb-4">Your Tickets ({tickets.length})</h2>

        {loading ? (
          <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div></div>
        ) : tickets.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <MessageSquare className="h-12 w-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-medium">You haven't submitted any tickets yet.</p>
            <button onClick={() => setShowNewForm(true)} className="mt-4 text-blue-500 hover:underline font-bold text-sm">
              Create your first ticket
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {tickets.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map(ticket => (
              <div key={ticket._id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div
                  className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50"
                  onClick={() => { 
                    if (expandedTicket === ticket._id) {
                      setExpandedTicket(null);
                    } else {
                      setExpandedTicket(ticket._id);
                      fetchTicketDetails(ticket._id);
                    }
                  }}
                >
                  <div className="flex items-center gap-4">
                    {ticket.status === 'Open' ? (
                      <AlertCircle className="h-5 w-5 text-red-500" />
                    ) : ticket.status === 'In Progress' ? (
                      <Clock className="h-5 w-5 text-amber-500" />
                    ) : (
                      <CheckCircle className="h-5 w-5 text-emerald-500" />
                    )}
                    <div>
                      <p className="font-bold text-gray-800 flex items-center gap-2">
                        {ticket.subject}
                        {ticket.order && (
                          <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                            Order #{ticket.order._id?.substring(0, 8)}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">#{ticket._id?.substring(0, 8)} · {new Date(ticket.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                      ticket.status === 'Open' ? 'bg-red-100 text-red-700' :
                      ticket.status === 'In Progress' ? 'bg-amber-100 text-amber-700' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>{ticket.status}</span>
                    {expandedTicket === ticket._id ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                  </div>
                </div>

                {expandedTicket === ticket._id && (
                  <div className="border-t border-gray-100 p-5">
                    {/* Messages Thread */}
                    <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                      {ticket.messages?.map((msg, i) => (
                        <div key={i} className={`p-3 rounded-lg text-sm ${
                          msg.sender?.role === 'support' || msg.sender?.role === 'admin'
                            ? 'bg-emerald-50 border border-emerald-100'
                            : 'bg-blue-50 border border-blue-100'
                        }`}>
                          <p className="font-bold text-xs text-gray-500 mb-1">
                            {msg.sender?.name || 'You'} {msg.sender?.role === 'support' || msg.sender?.role === 'admin' ? '(Support Agent)' : ''} · {new Date(msg.createdAt).toLocaleString()}
                          </p>
                          <p className="text-gray-700">{msg.content}</p>
                        </div>
                      ))}
                    </div>

                    {/* Reply */}
                    {ticket.status !== 'Closed' && (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Type your reply..."
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          className="flex-grow border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                          onKeyPress={(e) => e.key === 'Enter' && handleReply(ticket._id)}
                        />
                        <button onClick={() => handleReply(ticket._id)} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
                          <Send className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                    {ticket.status === 'Closed' && (
                      <p className="text-sm text-emerald-600 font-medium text-center">This ticket has been resolved. ✓</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactSupportPage;
