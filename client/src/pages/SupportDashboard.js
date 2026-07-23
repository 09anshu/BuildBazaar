import React, { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import socket from '../utils/socket';
import {
  Search, Package, Users, CheckCircle, Clock, Headphones, AlertCircle, RefreshCw,
  MessageSquare, FileText, BookOpen, Activity, Eye, Send, XCircle, Plus,
  ChevronDown, ChevronUp, Trash2, Edit3, Save, X, Ban, DollarSign, MapPin,
  ArrowRight, Circle, MessageCircle, Archive
} from 'lucide-react';

const SupportDashboard = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const [searchTerm, setSearchTerm] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [chatSessions, setChatSessions] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modals
  const [showCancelModal, setShowCancelModal] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [showRefundModal, setShowRefundModal] = useState(null);
  const [refundAmount, setRefundAmount] = useState('');
  const [showAddressModal, setShowAddressModal] = useState(null);
  const [addressForm, setAddressForm] = useState({ address: '', city: '', postalCode: '', country: '' });
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [faqForm, setFaqForm] = useState({ question: '', answer: '', category: 'General' });
  const [ticketReply, setTicketReply] = useState({});
  const [expandedTicket, setExpandedTicket] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [orderTimeline, setOrderTimeline] = useState([]);
  const [impersonating, setImpersonating] = useState(null);
  const [orderFilter, setOrderFilter] = useState('all');

  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!userInfo || (userInfo.role !== 'support' && userInfo.role !== 'admin')) {
      navigate('/login');
    } else {
      fetchData();
      // Join support socket room
      socket.emit('joinSupportRoom');
    }
  }, [navigate, userInfo]);

  // Socket listeners for real-time updates
  useEffect(() => {
    socket.on('newChatEscalation', () => {
      fetchChatSessions();
      toast.info('New chat escalation received!');
    });
    socket.on('orderStatusChanged', () => fetchOrders());

    return () => {
      socket.off('newChatEscalation');
      socket.off('orderStatusChanged');
    };
  }, []);

  const config = useCallback(() => ({
    headers: { Authorization: `Bearer ${userInfo?.token}` }
  }), [userInfo]);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchUsers(),
        fetchOrders(),
        fetchEnquiries(),
        fetchTickets(),
        fetchFaqs(),
        fetchChatSessions(),
        fetchActivityLogs(),
      ]);
    } catch (error) {
      toast.error('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/users', config());
      setAllUsers(res.data);
      setFilteredUsers(res.data);
    } catch (e) { /* ignore */ }
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get('/api/orders/standard', config());
      setOrders(res.data.filter(order => order.orderType !== 'enquiry'));
    } catch (e) { /* ignore */ }
  };

  const fetchEnquiries = async () => {
    try {
      const res = await axios.get('/api/orders/enquiries', config());
      setEnquiries(res.data);
    } catch (e) { /* ignore */ }
  };

  const fetchTickets = async () => {
    try {
      const res = await axios.get('/api/tickets', config());
      setTickets(res.data);
    } catch (e) { /* ignore */ }
  };

  const fetchFaqs = async () => {
    try {
      const res = await axios.get('/api/faqs/all', config());
      setFaqs(res.data);
    } catch (e) { /* ignore */ }
  };

  const fetchChatSessions = async () => {
    try {
      const res = await axios.get('/api/chat-sessions', config());
      setChatSessions(res.data);
    } catch (e) { /* ignore */ }
  };

  const fetchActivityLogs = async () => {
    try {
      const res = await axios.get('/api/activity-logs', config());
      setActivityLogs(res.data);
    } catch (e) { /* ignore */ }
  };

  const fetchOrderTimeline = async (orderId) => {
    try {
      const res = await axios.get(`/api/activity-logs/Order/${orderId}`, config());
      setOrderTimeline(res.data);
    } catch (e) { setOrderTimeline([]); }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      setFilteredUsers(allUsers);
    } else {
      const term = searchTerm.toLowerCase();
      setFilteredUsers(allUsers.filter(u =>
        u.email.toLowerCase().includes(term) ||
        u.name.toLowerCase().includes(term) ||
        u.phone?.toLowerCase().includes(term)
      ));
    }
  };

  // ─── Order Actions ─────────────────────────────────────────────
  const markAsDelivered = async (orderId) => {
    try {
      await axios.put(`/api/orders/${orderId}/deliver`, {}, config());
      toast.success('Order marked as delivered');
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating order status');
    }
  };

  const handleCancelOrder = async () => {
    if (!showCancelModal) return;
    try {
      await axios.put(`/api/orders/${showCancelModal}/cancel`, { reason: cancelReason }, config());
      toast.success('Order cancelled');
      setShowCancelModal(null);
      setCancelReason('');
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error cancelling order');
    }
  };

  const handleRefund = async () => {
    if (!showRefundModal) return;
    try {
      await axios.put(`/api/orders/${showRefundModal}/refund`, { refundAmount: Number(refundAmount), refundStatus: 'processed' }, config());
      toast.success('Refund processed');
      setShowRefundModal(null);
      setRefundAmount('');
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error processing refund');
    }
  };

  const handleUpdateAddress = async () => {
    if (!showAddressModal) return;
    try {
      await axios.put(`/api/orders/${showAddressModal}/update-address`, addressForm, config());
      toast.success('Address updated');
      setShowAddressModal(null);
      setAddressForm({ address: '', city: '', postalCode: '', country: '' });
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating address');
    }
  };

  // ─── Ticket Actions ────────────────────────────────────────────
  const handleTicketReply = async (ticketId) => {
    const content = ticketReply[ticketId];
    if (!content?.trim()) return;
    try {
      await axios.post(`/api/tickets/${ticketId}/messages`, { content }, config());
      toast.success('Reply sent');
      setTicketReply(prev => ({ ...prev, [ticketId]: '' }));
      fetchTickets();
    } catch (error) {
      toast.error('Error replying');
    }
  };

  const handleTicketStatus = async (ticketId, status) => {
    try {
      await axios.put(`/api/tickets/${ticketId}/status`, { status }, config());
      toast.success(`Ticket ${status.toLowerCase()}`);
      fetchTickets();
    } catch (error) {
      toast.error('Error updating ticket');
    }
  };

  // ─── FAQ Actions ───────────────────────────────────────────────
  const handleSaveFaq = async () => {
    try {
      if (editingFaq) {
        await axios.put(`/api/faqs/${editingFaq._id}`, faqForm, config());
        toast.success('FAQ updated');
      } else {
        await axios.post('/api/faqs', faqForm, config());
        toast.success('FAQ created');
      }
      setShowFaqModal(false);
      setEditingFaq(null);
      setFaqForm({ question: '', answer: '', category: 'General' });
      fetchFaqs();
    } catch (error) {
      toast.error('Error saving FAQ');
    }
  };

  const handleDeleteFaq = async (id) => {
    if (!window.confirm('Delete this FAQ?')) return;
    try {
      await axios.delete(`/api/faqs/${id}`, config());
      toast.success('FAQ deleted');
      fetchFaqs();
    } catch (error) {
      toast.error('Error deleting FAQ');
    }
  };

  const handleToggleFaqPublish = async (faq) => {
    try {
      await axios.put(`/api/faqs/${faq._id}`, { isPublished: !faq.isPublished }, config());
      toast.success(faq.isPublished ? 'FAQ unpublished' : 'FAQ published');
      fetchFaqs();
    } catch (error) {
      toast.error('Error toggling FAQ');
    }
  };

  // ─── Chat Actions ─────────────────────────────────────────────
  const handleClaimChat = async (sessionId) => {
    try {
      await axios.put(`/api/chat-sessions/${sessionId}/claim`, {}, config());
      toast.success('Chat session claimed');
      fetchChatSessions();
    } catch (error) {
      toast.error('Error claiming session');
    }
  };

  const handleCloseChat = async (sessionId) => {
    try {
      await axios.put(`/api/chat-sessions/${sessionId}/close`, {}, config());
      toast.success('Chat session closed');
      fetchChatSessions();
    } catch (error) {
      toast.error('Error closing session');
    }
  };

  // ─── Impersonation ────────────────────────────────────────────
  const handleImpersonate = (user) => {
    setImpersonating(user);
    toast.info(`Viewing as ${user.name}. This is read-only for support reference.`);
  };

  // ─── Stats ────────────────────────────────────────────────────
  const pendingDeliveries = orders.filter(o => !o.isDelivered && !o.isCancelled).length;
  const deliveredOrders = orders.filter(o => o.isDelivered).length;
  const openTickets = tickets.filter(t => t.status !== 'Closed').length;
  const totalCustomers = allUsers.filter(u => u.role === 'customer').length;
  const waitingChats = chatSessions.filter(s => s.status === 'waiting').length;
  const cancelledOrders = orders.filter(o => o.isCancelled).length;

  const filteredOrders = orders.filter(o => {
    if (orderFilter === 'pending') return !o.isDelivered && !o.isCancelled;
    if (orderFilter === 'delivered') return o.isDelivered;
    if (orderFilter === 'cancelled') return o.isCancelled;
    if (orderFilter === 'unpaid') return !o.isPaid && !o.isCancelled;
    return true;
  });

  const sidebarTabs = [
    { key: 'orders', label: 'Order Tracking', icon: Package, badge: pendingDeliveries },
    { key: 'tickets', label: 'Tickets', icon: MessageSquare, badge: openTickets },
    { key: 'enquiries', label: 'Enquiries', icon: FileText, badge: enquiries.length },
    { key: 'chat', label: 'Live Chat', icon: MessageCircle, badge: waitingChats },
    { key: 'users', label: 'User Lookup', icon: Users },
    { key: 'faqs', label: 'FAQ Editor', icon: BookOpen, badge: faqs.length },
    { key: 'logs', label: 'Activity Logs', icon: Activity },
  ];

  if (!userInfo) return null;

  return (
    <div className="bg-gray-100 min-h-screen flex">
      {/* Impersonation Banner */}
      {impersonating && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-black py-2 px-6 flex items-center justify-between text-sm font-bold shadow-lg">
          <span>👁️ Viewing as: {impersonating.name} ({impersonating.email}) — Role: {impersonating.role}</span>
          <button onClick={() => setImpersonating(null)} className="bg-black text-white px-3 py-1 rounded-lg text-xs hover:bg-gray-800">
            Exit View
          </button>
        </div>
      )}

      {/* Sidebar */}
      <div className={`w-64 bg-[#0f1117] text-white p-6 hidden md:flex flex-col ${impersonating ? 'mt-10' : ''}`}>
        <div className="flex items-center gap-2 mb-10">
          <Headphones className="h-6 w-6 text-blue-400" />
          <h2 className="text-xl font-bold text-blue-400">Support Panel</h2>
        </div>
        <nav className="space-y-1 flex-grow">
          {sidebarTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`w-full text-left p-3 rounded-lg flex items-center justify-between transition-all duration-200 ${activeTab === tab.key ? 'bg-blue-500 text-white font-bold shadow-lg shadow-blue-500/20' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
            >
              <span className="flex items-center">
                <tab.icon className="h-5 w-5 mr-3" />
                {tab.label}
              </span>
              {tab.badge > 0 && (
                <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-blue-500/20 text-blue-400'}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
        <div className="border-t border-white/10 pt-4 mt-4">
          <p className="text-xs text-white/40 mb-1">Logged in as</p>
          <p className="text-sm font-bold text-blue-400">{userInfo?.name}</p>
          <p className="text-xs text-white/50 uppercase">{userInfo?.role}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-grow p-8 overflow-y-auto ${impersonating ? 'mt-10' : ''}`}>
        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-orange-500">
            <p className="text-[10px] font-bold text-gray-500 uppercase">Pending</p>
            <p className="text-2xl font-black text-gray-800">{pendingDeliveries}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-emerald-500">
            <p className="text-[10px] font-bold text-gray-500 uppercase">Delivered</p>
            <p className="text-2xl font-black text-gray-800">{deliveredOrders}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-red-500">
            <p className="text-[10px] font-bold text-gray-500 uppercase">Cancelled</p>
            <p className="text-2xl font-black text-gray-800">{cancelledOrders}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-blue-500">
            <p className="text-[10px] font-bold text-gray-500 uppercase">Open Tickets</p>
            <p className="text-2xl font-black text-gray-800">{openTickets}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-amber-500">
            <p className="text-[10px] font-bold text-gray-500 uppercase">Waiting Chats</p>
            <p className="text-2xl font-black text-gray-800">{waitingChats}</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border-l-4 border-purple-500">
            <p className="text-[10px] font-bold text-gray-500 uppercase">Customers</p>
            <p className="text-2xl font-black text-gray-800">{totalCustomers}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>
        ) : (
          <>
            {/* ═══════════════════════════════════════════════════════════════
                TAB 1: ORDER TRACKING & FULFILLMENT
            ═══════════════════════════════════════════════════════════════ */}
            {activeTab === 'orders' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl font-bold text-gray-800">Order Tracking & Fulfillment</h1>
                  <div className="flex items-center gap-3">
                    <select value={orderFilter} onChange={(e) => setOrderFilter(e.target.value)} className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500">
                      <option value="all">All Orders</option>
                      <option value="pending">Pending</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="unpaid">Unpaid</option>
                    </select>
                    <button onClick={fetchData} className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-800">
                      <RefreshCw className="h-4 w-4" /> Refresh
                    </button>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payment</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredOrders.map(order => (
                        <React.Fragment key={order._id}>
                          <tr className="hover:bg-gray-50">
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-mono text-blue-600 hover:underline cursor-pointer" onClick={() => navigate(`/order/${order._id}`)}>
                              #{order._id.substring(0, 8)}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{order.user?.name || 'Unknown'}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm font-bold text-gray-900">₹{order.totalPrice?.toLocaleString('en-IN')}</td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              {order.isPaid ? (
                                <span className="flex items-center text-emerald-600 text-xs font-bold"><CheckCircle className="h-3.5 w-3.5 mr-1" /> Paid</span>
                              ) : (
                                <span className="flex items-center text-red-500 text-xs font-bold"><AlertCircle className="h-3.5 w-3.5 mr-1" /> Unpaid</span>
                              )}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              {order.isCancelled ? (
                                <span className="flex items-center text-red-600 text-xs font-bold"><Ban className="h-3.5 w-3.5 mr-1" /> Cancelled</span>
                              ) : order.isDelivered ? (
                                <span className="flex items-center text-emerald-600 text-xs font-bold"><CheckCircle className="h-3.5 w-3.5 mr-1" /> Delivered</span>
                              ) : (
                                <span className="flex items-center text-orange-500 text-xs font-bold"><Clock className="h-3.5 w-3.5 mr-1" /> Processing</span>
                              )}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-right">
                              <div className="flex items-center justify-end gap-1">
                                {!order.isDelivered && !order.isCancelled && (
                                  <button onClick={() => markAsDelivered(order._id)} className="bg-blue-500 hover:bg-blue-600 text-white text-[10px] font-bold py-1 px-2 rounded-lg transition-colors">
                                    Deliver
                                  </button>
                                )}
                                {!order.isCancelled && !order.isDelivered && (
                                  <button onClick={() => setShowCancelModal(order._id)} className="bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold py-1 px-2 rounded-lg transition-colors">
                                    Cancel
                                  </button>
                                )}
                                {order.isPaid && !order.isCancelled && order.refundStatus !== 'processed' && (
                                  <button onClick={() => { setShowRefundModal(order._id); setRefundAmount(order.totalPrice); }} className="bg-amber-500 hover:bg-amber-600 text-white text-[10px] font-bold py-1 px-2 rounded-lg transition-colors">
                                    Refund
                                  </button>
                                )}
                                {!order.isDelivered && !order.isCancelled && (
                                  <button onClick={() => { setShowAddressModal(order._id); setAddressForm(order.shippingAddress); }} className="bg-gray-500 hover:bg-gray-600 text-white text-[10px] font-bold py-1 px-2 rounded-lg transition-colors">
                                    <MapPin className="h-3 w-3" />
                                  </button>
                                )}
                                <button onClick={() => { if (expandedOrder === order._id) { setExpandedOrder(null); } else { setExpandedOrder(order._id); fetchOrderTimeline(order._id); } }} className="bg-gray-200 hover:bg-gray-300 text-gray-700 text-[10px] font-bold py-1 px-2 rounded-lg transition-colors">
                                  <Activity className="h-3 w-3" />
                                </button>
                              </div>
                              {order.refundStatus === 'processed' && (
                                <p className="text-[10px] text-emerald-600 font-bold mt-1">Refunded ₹{order.refundAmount?.toLocaleString('en-IN')}</p>
                              )}
                            </td>
                          </tr>
                          {/* Order Timeline Expansion */}
                          {expandedOrder === order._id && (
                            <tr>
                              <td colSpan={7} className="bg-gray-50 px-6 py-4">
                                <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2"><Activity className="h-4 w-4" /> Order Timeline</h4>
                                {orderTimeline.length > 0 ? (
                                  <div className="space-y-3 border-l-2 border-blue-200 pl-4">
                                    {orderTimeline.map((log, i) => (
                                      <div key={i} className="relative">
                                        <div className="absolute -left-[21px] top-1 h-3 w-3 bg-blue-500 rounded-full border-2 border-white" />
                                        <p className="text-sm font-bold text-gray-800">{log.action}</p>
                                        <p className="text-xs text-gray-500">{log.details}</p>
                                        <p className="text-[10px] text-gray-400 mt-0.5">
                                          {log.performedBy?.name} ({log.performedBy?.role}) · {new Date(log.createdAt).toLocaleString()}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-400">No activity logs for this order yet.</p>
                                )}
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                  {filteredOrders.length === 0 && (
                    <div className="text-center py-16">
                      <Package className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                      <p className="text-gray-400 font-medium">No orders found for this filter.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                TAB 2: TICKETING SYSTEM
            ═══════════════════════════════════════════════════════════════ */}
            {activeTab === 'tickets' && (
              <div>
                <h1 className="text-2xl font-bold mb-6 text-gray-800">Support Tickets</h1>
                <div className="space-y-4">
                  {tickets.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                      <MessageSquare className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                      <p className="text-gray-400 font-medium">No tickets yet.</p>
                    </div>
                  ) : (
                    tickets.map(ticket => (
                      <div key={ticket._id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div
                          className="flex items-center justify-between p-5 cursor-pointer hover:bg-gray-50"
                          onClick={() => setExpandedTicket(expandedTicket === ticket._id ? null : ticket._id)}
                        >
                          <div className="flex items-center gap-4">
                            <span className={`w-3 h-3 rounded-full ${ticket.status === 'Open' ? 'bg-red-500' : ticket.status === 'In Progress' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                            <div>
                              <p className="font-bold text-gray-800 flex items-center gap-2">
                                {ticket.subject}
                                {ticket.order && (
                                  <span className="bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                                    Order #{ticket.order._id?.substring(0, 8)}
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-gray-500">#{ticket._id.substring(0, 8)} · By {ticket.user?.name} · {new Date(ticket.createdAt).toLocaleDateString()}</p>
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
                            <p className="text-sm text-gray-600 mb-4 bg-gray-50 p-3 rounded-lg">{ticket.description}</p>

                            {/* Messages */}
                            <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                              {ticket.messages?.map((msg, i) => (
                                <div key={i} className={`p-3 rounded-lg text-sm ${msg.sender?._id === ticket.user?._id || msg.sender === ticket.user?._id ? 'bg-blue-50 border border-blue-100' : 'bg-emerald-50 border border-emerald-100'}`}>
                                  <p className="font-bold text-xs text-gray-500 mb-1">
                                    {msg.sender?.name || 'Customer'} · {new Date(msg.createdAt).toLocaleString()}
                                  </p>
                                  <p className="text-gray-700">{msg.content}</p>
                                </div>
                              ))}
                            </div>

                            {/* Reply & Actions */}
                            {ticket.status !== 'Closed' && (
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder="Type your reply..."
                                  value={ticketReply[ticket._id] || ''}
                                  onChange={(e) => setTicketReply(prev => ({ ...prev, [ticket._id]: e.target.value }))}
                                  className="flex-grow border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                                  onKeyPress={(e) => e.key === 'Enter' && handleTicketReply(ticket._id)}
                                />
                                <button onClick={() => handleTicketReply(ticket._id)} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
                                  <Send className="h-4 w-4" />
                                </button>
                                <button onClick={() => handleTicketStatus(ticket._id, 'Closed')} className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors">
                                  Close
                                </button>
                              </div>
                            )}
                            {ticket.status === 'Closed' && (
                              <button onClick={() => handleTicketStatus(ticket._id, 'Open')} className="text-xs text-blue-600 hover:underline font-bold">
                                Reopen Ticket
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                TAB 3: ENQUIRY MANAGEMENT
            ═══════════════════════════════════════════════════════════════ */}
            {activeTab === 'enquiries' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl font-bold text-gray-800">Enquiry Management</h1>
                  <button onClick={fetchEnquiries} className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-800">
                    <RefreshCw className="h-4 w-4" /> Refresh
                  </button>
                </div>
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {enquiries.map(enq => (
                        <tr key={enq._id} className="hover:bg-gray-50">
                          <td className="px-5 py-4 text-sm font-mono text-blue-600 cursor-pointer hover:underline" onClick={() => navigate(`/order/${enq._id}`)}>
                            #{enq._id.substring(0, 8)}
                          </td>
                          <td className="px-5 py-4 text-sm font-medium text-gray-800">{enq.user?.name || 'Unknown'}</td>
                          <td className="px-5 py-4 text-sm text-gray-600">{enq.orderItems?.length} item(s)</td>
                          <td className="px-5 py-4 text-sm text-gray-500 max-w-[200px] truncate">{enq.customNotes || '—'}</td>
                          <td className="px-5 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                              enq.enquiryStatus === 'pending' ? 'bg-amber-100 text-amber-700' :
                              enq.enquiryStatus === 'quoted' ? 'bg-blue-100 text-blue-700' :
                              enq.enquiryStatus === 'accepted' ? 'bg-emerald-100 text-emerald-700' :
                              enq.enquiryStatus === 'rejected' ? 'bg-red-100 text-red-700' :
                              'bg-purple-100 text-purple-700'
                            }`}>{enq.enquiryStatus}</span>
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-500">{new Date(enq.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {enquiries.length === 0 && (
                    <div className="text-center py-16">
                      <FileText className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                      <p className="text-gray-400 font-medium">No enquiries found.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                TAB 4: LIVE CHAT
            ═══════════════════════════════════════════════════════════════ */}
            {activeTab === 'chat' && (
              <div>
                <h1 className="text-2xl font-bold mb-6 text-gray-800">Live Chat Sessions</h1>
                {chatSessions.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                    <MessageCircle className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-400 font-medium">No active or waiting chat sessions.</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {chatSessions.map(session => (
                      <div key={session._id} className="bg-white rounded-xl shadow-sm p-5">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${session.status === 'waiting' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`} />
                            <div>
                              <p className="font-bold text-gray-800">{session.user?.name || 'Unknown User'}</p>
                              <p className="text-xs text-gray-500">{session.user?.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${session.status === 'waiting' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                              {session.status}
                            </span>
                            {session.status === 'waiting' && (
                              <button onClick={() => handleClaimChat(session._id)} className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors">
                                Claim
                              </button>
                            )}
                            {session.assignedAgent && (
                              <span className="text-xs text-gray-500">Agent: {session.assignedAgent?.name}</span>
                            )}
                            <button onClick={() => handleCloseChat(session._id)} className="bg-gray-200 hover:bg-gray-300 text-gray-600 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors">
                              Close
                            </button>
                          </div>
                        </div>

                        {/* Recent Messages Preview */}
                        {session.messages?.length > 0 && (
                          <div className="bg-gray-50 rounded-lg p-3 max-h-40 overflow-y-auto space-y-2">
                            {session.messages.slice(-5).map((msg, i) => (
                              <div key={i} className="text-xs">
                                <span className={`font-bold ${msg.sender === 'user' ? 'text-blue-600' : msg.sender === 'bot' ? 'text-gray-500' : 'text-emerald-600'}`}>
                                  {msg.sender === 'user' ? '👤 User' : msg.sender === 'bot' ? '🤖 Bot' : '🎧 Agent'}:
                                </span>{' '}
                                <span className="text-gray-700">{msg.content}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                TAB 5: USER LOOKUP
            ═══════════════════════════════════════════════════════════════ */}
            {activeTab === 'users' && (
              <div>
                <h1 className="text-2xl font-bold mb-6 text-gray-800">Global User Lookup</h1>
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                  <form onSubmit={handleSearch} className="flex gap-3">
                    <div className="relative flex-grow">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                        placeholder="Search by name, email, or phone number..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-6 py-3 rounded-xl transition-colors shadow-sm">
                      Search
                    </button>
                  </form>
                </div>
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                        <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredUsers.map(user => (
                        <tr key={user._id} className="hover:bg-gray-50">
                          <td className="px-5 py-4 whitespace-nowrap font-bold text-sm text-gray-800">{user.name}</td>
                          <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                          <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">{user.phone || '—'}</td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                              user.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                              user.role === 'sales' ? 'bg-amber-100 text-amber-700' :
                              user.role === 'support' ? 'bg-blue-100 text-blue-700' :
                              user.role === 'seller' ? 'bg-teal-100 text-teal-700' :
                              'bg-gray-100 text-gray-600'
                            }`}>{user.role}</span>
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                          <td className="px-5 py-4 whitespace-nowrap text-right">
                            <button onClick={() => handleImpersonate(user)} className="bg-amber-100 hover:bg-amber-200 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 ml-auto">
                              <Eye className="h-3 w-3" /> View As
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredUsers.length === 0 && (
                    <div className="text-center py-16">
                      <Users className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                      <p className="text-gray-400 font-medium">No users found matching your search.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                TAB 6: FAQ / KNOWLEDGE BASE EDITOR
            ═══════════════════════════════════════════════════════════════ */}
            {activeTab === 'faqs' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl font-bold text-gray-800">FAQ / Knowledge Base Editor</h1>
                  <button onClick={() => { setShowFaqModal(true); setEditingFaq(null); setFaqForm({ question: '', answer: '', category: 'General' }); }} className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-2 text-sm">
                    <Plus className="h-4 w-4" /> Add FAQ
                  </button>
                </div>
                <div className="space-y-3">
                  {faqs.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                      <BookOpen className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                      <p className="text-gray-400 font-medium">No FAQs created yet. Click "Add FAQ" to start.</p>
                    </div>
                  ) : (
                    faqs.map(faq => (
                      <div key={faq._id} className={`bg-white rounded-xl shadow-sm p-5 border-l-4 ${faq.isPublished ? 'border-emerald-500' : 'border-gray-300'}`}>
                        <div className="flex items-start justify-between">
                          <div className="flex-grow">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[10px] font-bold uppercase">{faq.category}</span>
                              {!faq.isPublished && <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-[10px] font-bold uppercase">Draft</span>}
                            </div>
                            <p className="font-bold text-gray-800">{faq.question}</p>
                            <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">{faq.answer}</p>
                            <p className="text-[10px] text-gray-400 mt-2">By {faq.createdBy?.name || 'Unknown'} · {new Date(faq.createdAt).toLocaleDateString()}</p>
                          </div>
                          <div className="flex items-center gap-1 ml-4">
                            <button onClick={() => handleToggleFaqPublish(faq)} className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${faq.isPublished ? 'bg-gray-200 text-gray-600 hover:bg-gray-300' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}>
                              {faq.isPublished ? 'Unpublish' : 'Publish'}
                            </button>
                            <button onClick={() => { setEditingFaq(faq); setFaqForm({ question: faq.question, answer: faq.answer, category: faq.category }); setShowFaqModal(true); }} className="bg-blue-100 hover:bg-blue-200 text-blue-700 p-1.5 rounded-lg transition-colors">
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => handleDeleteFaq(faq._id)} className="bg-red-100 hover:bg-red-200 text-red-700 p-1.5 rounded-lg transition-colors">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════
                TAB 7: ACTIVITY LOGS
            ═══════════════════════════════════════════════════════════════ */}
            {activeTab === 'logs' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl font-bold text-gray-800">Activity Logs</h1>
                  <button onClick={fetchActivityLogs} className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-800">
                    <RefreshCw className="h-4 w-4" /> Refresh
                  </button>
                </div>
                {activityLogs.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                    <Activity className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                    <p className="text-gray-400 font-medium">No activity logs recorded yet.</p>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="space-y-0 divide-y divide-gray-100">
                      {activityLogs.map((log, i) => (
                        <div key={i} className="flex items-start gap-4 p-4 hover:bg-gray-50">
                          <div className={`mt-1 p-2 rounded-lg ${
                            log.action.includes('Cancel') ? 'bg-red-100 text-red-600' :
                            log.action.includes('Refund') ? 'bg-amber-100 text-amber-600' :
                            log.action.includes('Delivered') ? 'bg-emerald-100 text-emerald-600' :
                            'bg-blue-100 text-blue-600'
                          }`}>
                            <Activity className="h-4 w-4" />
                          </div>
                          <div className="flex-grow">
                            <p className="text-sm font-bold text-gray-800">{log.action}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{log.details}</p>
                            <p className="text-[10px] text-gray-400 mt-1">
                              {log.entityType} #{log.entityId?.toString().substring(0, 8)} · {log.performedBy?.name} · {new Date(log.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          MODALS
      ═══════════════════════════════════════════════════════════════ */}

      {/* Cancel Order Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><Ban className="h-5 w-5 text-red-500" /> Cancel Order</h3>
            <textarea
              placeholder="Reason for cancellation..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-red-500 h-24 resize-none"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => { setShowCancelModal(null); setCancelReason(''); }} className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleCancelOrder} className="px-4 py-2 text-sm font-bold text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors">Confirm Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><DollarSign className="h-5 w-5 text-amber-500" /> Process Refund</h3>
            <label className="text-sm font-medium text-gray-600 block mb-1">Refund Amount (₹)</label>
            <input
              type="number"
              value={refundAmount}
              onChange={(e) => setRefundAmount(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => { setShowRefundModal(null); setRefundAmount(''); }} className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleRefund} className="px-4 py-2 text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors">Process Refund</button>
            </div>
          </div>
        </div>
      )}

      {/* Update Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2"><MapPin className="h-5 w-5 text-blue-500" /> Update Shipping Address</h3>
            <div className="space-y-3">
              <input type="text" placeholder="Address" value={addressForm.address} onChange={(e) => setAddressForm(p => ({ ...p, address: e.target.value }))} className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
              <input type="text" placeholder="City" value={addressForm.city} onChange={(e) => setAddressForm(p => ({ ...p, city: e.target.value }))} className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
              <input type="text" placeholder="Postal Code" value={addressForm.postalCode} onChange={(e) => setAddressForm(p => ({ ...p, postalCode: e.target.value }))} className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
              <input type="text" placeholder="Country" value={addressForm.country} onChange={(e) => setAddressForm(p => ({ ...p, country: e.target.value }))} className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => { setShowAddressModal(null); setAddressForm({ address: '', city: '', postalCode: '', country: '' }); }} className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleUpdateAddress} className="px-4 py-2 text-sm font-bold text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors">Update Address</button>
            </div>
          </div>
        </div>
      )}

      {/* FAQ Create/Edit Modal */}
      {showFaqModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl">
            <h3 className="text-lg font-bold text-gray-800 mb-4">{editingFaq ? 'Edit FAQ' : 'Create New FAQ'}</h3>
            <div className="space-y-3">
              <select value={faqForm.category} onChange={(e) => setFaqForm(p => ({ ...p, category: e.target.value }))} className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
                {['General', 'Orders', 'Payments', 'Shipping', 'Returns', 'Account', 'Sellers', 'Other'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <input type="text" placeholder="Question" value={faqForm.question} onChange={(e) => setFaqForm(p => ({ ...p, question: e.target.value }))} className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" />
              <textarea placeholder="Answer" value={faqForm.answer} onChange={(e) => setFaqForm(p => ({ ...p, answer: e.target.value }))} className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 h-32 resize-none" />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button onClick={() => { setShowFaqModal(false); setEditingFaq(null); }} className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button onClick={handleSaveFaq} className="px-4 py-2 text-sm font-bold text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors flex items-center gap-2">
                <Save className="h-4 w-4" /> {editingFaq ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportDashboard;
