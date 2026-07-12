import React, { useEffect, useState } from 'react';
import socket from '../utils/socket';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import { fetchAdminOffers, createOffer, deleteOffer, updateOffer } from '../store/slices/offerSlice';
import { listProducts } from '../store/slices/productSlice';
import { Tag, FileText, Plus, Trash2, ToggleLeft, ToggleRight, TrendingUp, MessageSquare, IndianRupee, ClipboardList, Clock } from 'lucide-react';

const SalesDashboard = () => {
  const [activeTab, setActiveTab] = useState('quotes');
  const [enquiries, setEnquiries] = useState([]);
  const [liveOrders, setLiveOrders] = useState([]);
  const [orderHistory, setOrderHistory] = useState([]);
  const [loadingQuotes, setLoadingQuotes] = useState(false);
  const [loadingLiveSheet, setLoadingLiveSheet] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyFilter, setHistoryFilter] = useState('all');

  // Offer Form State
  const [offerTitle, setOfferTitle] = useState('');
  const [offerCode, setOfferCode] = useState('');
  const [offerPercent, setOfferPercent] = useState('');
  const [isOfferActive, setIsOfferActive] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState([]);

  // Set default dates: today and 7 days from today
  const today = new Date().toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const [validFrom, setValidFrom] = useState(today);
  const [validUntil, setValidUntil] = useState(nextWeek);

  // Quote Modal State
  const [showQuoteModal, setShowQuoteModal] = useState(false);
  const [selectedQuoteId, setSelectedQuoteId] = useState(null);
  const [quotePrice, setQuotePrice] = useState('');
  const [quoteNotes, setQuoteNotes] = useState('');
  const [salesCounterLoading, setSalesCounterLoading] = useState(false);
  const [isSalesCounterMode, setIsSalesCounterMode] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { userInfo } = useSelector((state) => state.auth);
  const { offers, loading: offersLoading } = useSelector((state) => state.offers);
  const { products } = useSelector((state) => state.products);

  useEffect(() => {
    if (!userInfo || (userInfo.role !== 'sales' && userInfo.role !== 'admin')) {
      navigate('/login');
    } else {
      fetchEnquiries();
      fetchLiveSheet();
      fetchOrderHistory();
      dispatch(fetchAdminOffers());
      dispatch(listProducts({ pageSize: 1000 }));
    }
  }, [navigate, userInfo, dispatch]);

  // Real-time updates: refresh data when status changes or new enquiry arrives
  useEffect(() => {
    if (!userInfo) return;

    const onEnquiryStatusChanged = () => {
      fetchEnquiries();
      fetchLiveSheet();
      fetchOrderHistory();
      toast.info('Enquiry status updated');
    };

    const onNewEnquiry = () => {
      fetchEnquiries();
      fetchOrderHistory();
      toast.info('New enquiry received');
    };

    socket.on('enquiryStatusChanged', onEnquiryStatusChanged);
    socket.on('newEnquiry', onNewEnquiry);

    const onQuoteCounterProposed = () => {
      fetchEnquiries();
      fetchOrderHistory();
      toast.info('Customer proposed a counter-offer');
    };

    socket.on('quoteCounterProposed', onQuoteCounterProposed);

    const onOrderStatusChanged = () => {
      fetchLiveSheet();
      fetchOrderHistory();
    };

    socket.on('orderStatusChanged', onOrderStatusChanged);

    return () => {
      socket.off('enquiryStatusChanged', onEnquiryStatusChanged);
      socket.off('newEnquiry', onNewEnquiry);
      socket.off('quoteCounterProposed', onQuoteCounterProposed);
      socket.off('orderStatusChanged', onOrderStatusChanged);
    };
  }, [userInfo]);

  const fetchEnquiries = async () => {
    setLoadingQuotes(true);
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get('/api/orders/enquiries', config);
      setEnquiries(data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error fetching quotes');
    } finally {
      setLoadingQuotes(false);
    }
  };

  const fetchLiveSheet = async () => {
    setLoadingLiveSheet(true);
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get('/api/orders/sales-closed', config);
      setLiveOrders(data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error fetching live sheet');
    } finally {
      setLoadingLiveSheet(false);
    }
  };

  const fetchOrderHistory = async () => {
    setLoadingHistory(true);
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get('/api/orders/sales-history', config);
      setOrderHistory(data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error fetching order history');
    } finally {
      setLoadingHistory(false);
    }
  };

  const submitOfferHandler = (e) => {
    e.preventDefault();
    if (!offerTitle || !offerPercent) {
      return toast.error('Please fill all required fields');
    }
    dispatch(createOffer({
      title: offerTitle,
      discountCode: offerCode,
      discountPercent: Number(offerPercent),
      isActive: isOfferActive,
      applicableProducts: selectedProducts,
      validFrom,
      validUntil
    })).then(() => {
      setOfferTitle('');
      setOfferCode('');
      setOfferPercent('');
      setSelectedProducts([]);
      setValidFrom(today);
      setValidUntil(nextWeek);
      toast.success('Offer created successfully');
    });
  };

  const toggleOfferHandler = (offer) => {
    dispatch(updateOffer({ id: offer._id, offerData: { isActive: !offer.isActive } }));
  };

  const deleteOfferHandler = (id) => {
    if (window.confirm('Are you sure you want to delete this offer?')) {
      dispatch(deleteOffer(id));
    }
  };

  const handleProductSelect = (productId) => {
    setSelectedProducts(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleOpenQuoteModal = (e, enq) => {
    e.stopPropagation();
    setSelectedQuoteId(enq._id);
    setQuotePrice(enq.totalPrice || '');
    setQuoteNotes(enq.negotiationNotes || '');
    setShowQuoteModal(true);
    setIsSalesCounterMode(false);
  };

  const submitQuoteHandler = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      if (isSalesCounterMode) {
        await axios.put(`/api/orders/${selectedQuoteId}/counter-by-sales`, {
          counterPrice: quotePrice ? Number(quotePrice) : undefined,
          counterNotes: quoteNotes
        }, config);
      } else {
        await axios.put(`/api/orders/${selectedQuoteId}/quote`, {
          totalPrice: quotePrice,
          negotiationNotes: quoteNotes
        }, config);
      }
      toast.success('Quote sent to customer!');
      setShowQuoteModal(false);
      setIsSalesCounterMode(false);
      fetchEnquiries();
      fetchOrderHistory();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error sending quote');
    }
  };

  const handleAcceptCounter = async (e, enq) => {
    e.stopPropagation();
    if (!userInfo) return toast.error('Not authenticated');
    setSalesCounterLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.put(`/api/orders/${enq._id}/accept-counter`, {}, config);
      toast.success('Counter accepted');
      fetchEnquiries();
      fetchLiveSheet();
      fetchOrderHistory();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error accepting counter');
    } finally {
      setSalesCounterLoading(false);
    }
  };

  const handleRejectEnquiry = async (e, enq) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to reject this enquiry?')) return;
    
    setSalesCounterLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.put(`/api/orders/${enq._id}/reject`, { reason: 'Sales rejected this enquiry.' }, config);
      toast.info('Enquiry rejected');
      fetchEnquiries();
      fetchOrderHistory();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error rejecting enquiry');
    } finally {
      setSalesCounterLoading(false);
    }
  };

  const handleDeclineCounter = async (e, enq) => {
    e.stopPropagation();
    if (!userInfo) return toast.error('Not authenticated');
    setSalesCounterLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.put(`/api/orders/${enq._id}/decline-counter`, {}, config);
      toast.info('Counter declined');
      fetchEnquiries();
      fetchOrderHistory();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error declining counter');
    } finally {
      setSalesCounterLoading(false);
    }
  };

  const handleOpenSalesCounterModal = (e, enq) => {
    e.stopPropagation();
    setSelectedQuoteId(enq._id);
    setQuotePrice(enq.counterPrice || enq.totalPrice || '');
    setQuoteNotes(enq.negotiationNotes || '');
    setShowQuoteModal(true);
    setIsSalesCounterMode(true);
  };

  const exportToExcel = () => {
    const dataToExport = enquiries.map(enq => ({
      ID: enq._id,
      Customer: enq.user?.name || 'Unknown User',
      Email: enq.user?.email || 'Unknown Email',
      Status: enq.enquiryStatus,
      Items_Count: enq.orderItems.length,
      Customer_Notes: enq.customNotes || '',
      Negotiation_Notes: enq.negotiationNotes || '',
      Quoted_Price: enq.totalPrice,
      Created_At: new Date(enq.createdAt).toLocaleDateString()
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Quotes");
    XLSX.writeFile(wb, "Quotes_Export.xlsx");
    toast.success('Excel file exported!');
  };

  const exportLiveSheetToExcel = () => {
    const dataToExport = liveOrders.map(order => ({
      ID: order._id,
      Customer: order.user?.name || 'Unknown User',
      Email: order.user?.email || 'Unknown Email',
      Status: order.isDelivered ? 'Delivered' : order.isPaid ? 'Paid' : 'Won',
      Items_Count: order.orderItems?.length || 0,
      Total_Price: order.totalPrice || 0,
      Paid: order.isPaid ? 'Yes' : 'No',
      Delivered: order.isDelivered ? 'Yes' : 'No',
      Updated_At: order.updatedAt ? new Date(order.updatedAt).toLocaleString() : '',
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Live Sheet');
    XLSX.writeFile(wb, 'Live_Sales_Sheet.xlsx');
    toast.success('Live sheet exported!');
  };

  const getOrderStatusLabel = (order) => {
    if (order.enquiryStatus === 'accepted' && order.isDelivered) return 'Delivered';
    if (order.enquiryStatus === 'accepted' && order.isPaid) return 'Paid';
    if (order.enquiryStatus === 'accepted') return 'Won';
    if (order.enquiryStatus === 'rejected') return 'Rejected';
    if (order.enquiryStatus === 'countered') return 'Countered';
    if (order.enquiryStatus === 'quoted') return 'Quoted';
    return 'Pending';
  };

  const getOrderStatusStyle = (label) => {
    switch (label) {
      case 'Delivered': return 'bg-blue-100 text-blue-800';
      case 'Paid': return 'bg-teal-100 text-teal-800';
      case 'Won': return 'bg-emerald-100 text-emerald-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      case 'Countered': return 'bg-indigo-100 text-indigo-800';
      case 'Quoted': return 'bg-amber-100 text-amber-800';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredHistory = historyFilter === 'all'
    ? orderHistory
    : orderHistory.filter(order => {
        const label = getOrderStatusLabel(order).toLowerCase();
        return label === historyFilter;
      });

  const exportHistoryToExcel = () => {
    const dataToExport = filteredHistory.map(order => ({
      Order_ID: order._id,
      Customer: order.user?.name || 'Unknown User',
      Email: order.user?.email || 'Unknown Email',
      Status: getOrderStatusLabel(order),
      Items_Count: order.orderItems?.length || 0,
      Items: order.orderItems?.map(item => `${item.name} x${item.qty}`).join(', ') || '',
      Customer_Notes: order.customNotes || '',
      Negotiation_Notes: order.negotiationNotes || '',
      Counter_Price: order.counterPrice || '',
      Quoted_Price: order.totalPrice || 0,
      Paid: order.isPaid ? 'Yes' : 'No',
      Delivered: order.isDelivered ? 'Yes' : 'No',
      Created_At: new Date(order.createdAt).toLocaleString(),
      Updated_At: order.updatedAt ? new Date(order.updatedAt).toLocaleString() : '',
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Order History');
    XLSX.writeFile(wb, 'Sales_Order_History.xlsx');
    toast.success('Order history exported!');
  };

  // Stats — computed from the complete order history for accuracy
  const pendingCount = orderHistory.filter(e => e.enquiryStatus === 'pending' && e.orderType === 'enquiry').length;
  const quotedCount = orderHistory.filter(e => e.enquiryStatus === 'quoted').length;
  const acceptedCount = orderHistory.filter(e => e.enquiryStatus === 'accepted').length;
  const rejectedCount = orderHistory.filter(e => e.enquiryStatus === 'rejected').length;
  const activeOffers = offers.filter(o => o.isActive).length;

  const statusColors = {
    pending: { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-300', dot: 'bg-gray-400', label: 'New Requests' },
    quoted: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-300', dot: 'bg-amber-500', label: 'Quote Sent' },
    countered: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-300', dot: 'bg-blue-500', label: 'Counter Proposed' },
    accepted: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-300', dot: 'bg-emerald-500', label: 'Closed / Won' },
    rejected: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-300', dot: 'bg-red-500', label: 'Rejected' },
  };

  if (!userInfo) return null;

  return (
    <div className="bg-gray-100 min-h-screen flex">
      {/* Sidebar */}
      <div className="w-64 bg-[#0f1117] text-white p-6 hidden md:flex flex-col">
        <div className="flex items-center gap-2 mb-10">
          <TrendingUp className="h-6 w-6 text-[#f5a623]" />
          <h2 className="text-xl font-bold text-[#f5a623]">Sales Panel</h2>
        </div>
        <nav className="space-y-2 flex-grow">
          <button onClick={() => setActiveTab('quotes')} className={`w-full text-left p-3 rounded-lg flex items-center transition-all duration-200 ${activeTab === 'quotes' ? 'bg-[#f5a623] text-[#0f1117] font-bold shadow-lg shadow-[#f5a623]/20' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
            <MessageSquare className="h-5 w-5 mr-3" /> Quotes & Enquiries
          </button>
          <button onClick={() => setActiveTab('live-sheet')} className={`w-full text-left p-3 rounded-lg flex items-center transition-all duration-200 ${activeTab === 'live-sheet' ? 'bg-[#f5a623] text-[#0f1117] font-bold shadow-lg shadow-[#f5a623]/20' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
            <FileText className="h-5 w-5 mr-3" /> Live Sheet
          </button>
          <button onClick={() => setActiveTab('order-history')} className={`w-full text-left p-3 rounded-lg flex items-center transition-all duration-200 ${activeTab === 'order-history' ? 'bg-[#f5a623] text-[#0f1117] font-bold shadow-lg shadow-[#f5a623]/20' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
            <ClipboardList className="h-5 w-5 mr-3" /> Order History
          </button>
          <button onClick={() => setActiveTab('offers')} className={`w-full text-left p-3 rounded-lg flex items-center transition-all duration-200 ${activeTab === 'offers' ? 'bg-[#f5a623] text-[#0f1117] font-bold shadow-lg shadow-[#f5a623]/20' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
            <Tag className="h-5 w-5 mr-3" /> Offer Management
          </button>
        </nav>
        <div className="border-t border-white/10 pt-4 mt-4">
          <p className="text-xs text-white/40 mb-1">Logged in as</p>
          <p className="text-sm font-bold text-[#f5a623]">{userInfo?.name}</p>
          <p className="text-xs text-white/50 uppercase">{userInfo?.role}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow p-8 overflow-y-auto">
        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-gray-400">
            <p className="text-xs font-bold text-gray-500 uppercase">New Requests</p>
            <p className="text-2xl font-black text-gray-800 mt-1">{pendingCount}</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-amber-500">
            <p className="text-xs font-bold text-gray-500 uppercase">Quotes Sent</p>
            <p className="text-2xl font-black text-gray-800 mt-1">{quotedCount}</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-emerald-500">
            <p className="text-xs font-bold text-gray-500 uppercase">Won / Accepted</p>
            <p className="text-2xl font-black text-gray-800 mt-1">{acceptedCount}</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-red-400">
            <p className="text-xs font-bold text-gray-500 uppercase">Rejected</p>
            <p className="text-2xl font-black text-gray-800 mt-1">{rejectedCount}</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-[#f5a623]">
            <p className="text-xs font-bold text-gray-500 uppercase">Active Offers</p>
            <p className="text-2xl font-black text-gray-800 mt-1">{activeOffers}</p>
          </div>
        </div>

        {/* ===== QUOTES TAB ===== */}
        {activeTab === 'quotes' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Quote Kanban Board</h1>
              <button
                onClick={exportToExcel}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center transition-colors"
              >
                <FileText className="h-4 w-4 mr-2" /> Export to Excel
              </button>
            </div>
            {loadingQuotes ? (
              <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f5a623]"></div></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {['pending', 'quoted', 'countered', 'accepted', 'rejected'].map(status => {
                  const colors = statusColors[status];
                  return (
                    <div key={status} className={`${colors.bg} p-4 rounded-xl border ${colors.border} min-h-[450px]`}>
                      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                        <span className={`h-2.5 w-2.5 rounded-full ${colors.dot}`}></span>
                        <h3 className={`font-bold text-sm uppercase tracking-wider ${colors.text}`}>{colors.label}</h3>
                        <span className={`ml-auto text-xs font-bold ${colors.text} bg-white px-2 py-0.5 rounded-full`}>
                          {enquiries.filter(e => e.enquiryStatus === status).length}
                        </span>
                      </div>
                      {enquiries.filter(e => e.enquiryStatus === status).map(enq => (
                        <div
                          key={enq._id}
                          className="bg-white p-4 rounded-lg mb-3 border border-gray-100 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => navigate(`/order/${enq._id}`)}
                        >
                          {enq.counterPrice ? (
                            <div className="mb-2 rounded-md bg-blue-50 border border-blue-100 p-2 text-sm text-blue-700">
                              Counter: ₹{enq.counterPrice.toLocaleString('en-IN')}
                            </div>
                          ) : null}
                          <p className="text-[10px] text-gray-400 font-mono mb-1">#{enq._id.substring(0, 8)}</p>
                          <p className="font-bold text-sm text-gray-800 mb-1">{enq.user?.name || 'Unknown User'}</p>
                          <p className="text-xs text-gray-500 mb-2">{enq.orderItems.length} item{enq.orderItems.length > 1 ? 's' : ''} requested</p>
                          {enq.customNotes && <p className="text-xs text-gray-400 italic truncate mb-2">"{enq.customNotes}"</p>}
                          {enq.totalPrice > 0 && (
                            <p className="text-sm font-bold text-emerald-600 flex items-center mb-2"><IndianRupee className="h-3 w-3 mr-0.5" />{enq.totalPrice.toLocaleString('en-IN')}</p>
                          )}
                          {(status === 'pending' || status === 'quoted') && (
                            <div className="mt-2 flex gap-2">
                              <button
                                onClick={(e) => handleOpenQuoteModal(e, enq)}
                                className="flex-[2] py-1.5 bg-[#f5a623]/20 hover:bg-[#f5a623]/40 text-[#f5a623] font-bold text-xs rounded-md transition-colors"
                              >
                                Provide Quote
                              </button>
                              <button
                                onClick={(e) => handleRejectEnquiry(e, enq)}
                                className="flex-1 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs rounded-md transition-colors border border-red-100"
                              >
                                Reject
                              </button>
                            </div>
                          )}

                          {status === 'countered' && (
                            <div className="mt-2 flex gap-2">
                              <button onClick={(e) => handleAcceptCounter(e, enq)} className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-md">{salesCounterLoading ? '...' : 'Accept Counter'}</button>
                              <button onClick={(e) => handleOpenSalesCounterModal(e, enq)} className="flex-1 py-1.5 bg-white border border-blue-400 text-blue-700 font-bold text-xs rounded-md">Propose Another</button>
                              <button onClick={(e) => handleDeclineCounter(e, enq)} className="flex-1 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 font-bold text-xs rounded-md">Decline</button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ===== LIVE SHEET TAB ===== */}
        {activeTab === 'live-sheet' && (
          <div>
            <div className="flex justify-between items-center mb-6 gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Realtime Closed / Won Sheet</h1>
                <p className="text-sm text-gray-500">Live spreadsheet view of accepted and closed sales orders.</p>
              </div>
              <button
                onClick={exportLiveSheetToExcel}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center transition-colors"
              >
                <FileText className="h-4 w-4 mr-2" /> Export Live Sheet
              </button>
            </div>

            {loadingLiveSheet ? (
              <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f5a623]"></div></div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Open</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {liveOrders.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="px-4 py-16 text-center text-gray-500">
                            No closed or won orders yet.
                          </td>
                        </tr>
                      ) : (
                        liveOrders.map((order) => (
                          <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-4 text-sm font-mono text-gray-700">#{order._id.substring(0, 8)}</td>
                            <td className="px-4 py-4 text-sm font-medium text-gray-900">{order.user?.name || 'Unknown User'}</td>
                            <td className="px-4 py-4 text-sm text-gray-600">{order.user?.email || 'Unknown Email'}</td>
                            <td className="px-4 py-4 text-sm">
                              <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${order.isDelivered ? 'bg-blue-100 text-blue-800' : order.isPaid ? 'bg-teal-100 text-teal-800' : 'bg-emerald-100 text-emerald-800'}`}>
                                {order.isDelivered ? 'Delivered' : order.isPaid ? 'Paid' : 'Won'}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-sm text-gray-700">{order.orderItems?.length || 0}</td>
                            <td className="px-4 py-4 text-sm font-bold text-emerald-600">₹{Number(order.totalPrice || 0).toLocaleString('en-IN')}</td>
                            <td className="px-4 py-4 text-sm text-gray-500">{order.updatedAt ? new Date(order.updatedAt).toLocaleString() : '—'}</td>
                            <td className="px-4 py-4 text-right">
                              <button
                                onClick={() => navigate(`/order/${order._id}`)}
                                className="text-blue-600 hover:underline text-sm font-medium"
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== ORDER HISTORY TAB ===== */}
        {activeTab === 'order-history' && (
          <div>
            <div className="flex justify-between items-center mb-6 gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Sales Pipeline History</h1>
                <p className="text-sm text-gray-500">Complete history of all enquiries and their outcomes — won, lost, pending, and in-progress.</p>
              </div>
              <button
                onClick={exportHistoryToExcel}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center transition-colors whitespace-nowrap"
              >
                <FileText className="h-4 w-4 mr-2" /> Export History
              </button>
            </div>

            {/* Status Filter */}
            <div className="flex flex-wrap gap-2 mb-6">
              {[
                { key: 'all', label: 'All', count: orderHistory.length },
                { key: 'pending', label: 'Pending', count: orderHistory.filter(o => getOrderStatusLabel(o) === 'Pending').length },
                { key: 'quoted', label: 'Quoted', count: orderHistory.filter(o => getOrderStatusLabel(o) === 'Quoted').length },
                { key: 'countered', label: 'Countered', count: orderHistory.filter(o => getOrderStatusLabel(o) === 'Countered').length },
                { key: 'won', label: 'Won', count: orderHistory.filter(o => getOrderStatusLabel(o) === 'Won').length },
                { key: 'paid', label: 'Paid', count: orderHistory.filter(o => getOrderStatusLabel(o) === 'Paid').length },
                { key: 'delivered', label: 'Delivered', count: orderHistory.filter(o => getOrderStatusLabel(o) === 'Delivered').length },
                { key: 'rejected', label: 'Rejected', count: orderHistory.filter(o => getOrderStatusLabel(o) === 'Rejected').length },
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => setHistoryFilter(f.key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                    historyFilter === f.key
                      ? 'bg-[#f5a623] text-[#0f1117] shadow-sm'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {f.label} ({f.count})
                </button>
              ))}
            </div>

            {loadingHistory ? (
              <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f5a623]"></div></div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0 z-10">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Counter</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivered</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Open</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredHistory.length === 0 ? (
                        <tr>
                          <td colSpan="11" className="px-4 py-16 text-center text-gray-500">
                            <ClipboardList className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                            <p className="font-medium">No orders found{historyFilter !== 'all' ? ` for "${historyFilter}" filter` : ''}.</p>
                          </td>
                        </tr>
                      ) : (
                        filteredHistory.map((order) => {
                          const label = getOrderStatusLabel(order);
                          const style = getOrderStatusStyle(label);
                          return (
                            <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-4 py-4 text-sm font-mono text-gray-700">#{order._id.substring(0, 8)}</td>
                              <td className="px-4 py-4 text-sm font-medium text-gray-900">{order.user?.name || 'Unknown'}</td>
                              <td className="px-4 py-4 text-sm text-gray-600">{order.user?.email || '—'}</td>
                              <td className="px-4 py-4 text-sm">
                                <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${style}`}>
                                  {label}
                                </span>
                              </td>
                              <td className="px-4 py-4 text-sm text-gray-700">{order.orderItems?.length || 0}</td>
                              <td className="px-4 py-4 text-sm font-bold text-gray-800">
                                {order.totalPrice > 0 ? `₹${Number(order.totalPrice).toLocaleString('en-IN')}` : '—'}
                              </td>
                              <td className="px-4 py-4 text-sm text-indigo-600 font-medium">
                                {order.counterPrice > 0 ? `₹${Number(order.counterPrice).toLocaleString('en-IN')}` : '—'}
                              </td>
                              <td className="px-4 py-4 text-sm">
                                {order.isPaid ? (
                                  <span className="inline-flex items-center text-emerald-600 font-bold text-xs">✓ Yes</span>
                                ) : (
                                  <span className="text-gray-400 text-xs">No</span>
                                )}
                              </td>
                              <td className="px-4 py-4 text-sm">
                                {order.isDelivered ? (
                                  <span className="inline-flex items-center text-blue-600 font-bold text-xs">✓ Yes</span>
                                ) : (
                                  <span className="text-gray-400 text-xs">No</span>
                                )}
                              </td>
                              <td className="px-4 py-4 text-sm text-gray-500 whitespace-nowrap">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {new Date(order.createdAt).toLocaleDateString()}
                                </div>
                              </td>
                              <td className="px-4 py-4 text-right">
                                <button
                                  onClick={() => navigate(`/order/${order._id}`)}
                                  className="text-blue-600 hover:underline text-sm font-medium"
                                >
                                  View
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
                {/* Row count footer */}
                <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 text-xs text-gray-500 font-medium">
                  Showing {filteredHistory.length} of {orderHistory.length} records
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===== OFFERS TAB ===== */}
        {activeTab === 'offers' && (
          <div>
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Offer & Promo Management</h1>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Create Form */}
              <div className="lg:col-span-1">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <h2 className="text-lg font-bold mb-4 flex items-center"><Plus className="mr-2 h-5 w-5 text-[#f5a623]" /> Create New Offer</h2>
                  <form onSubmit={submitOfferHandler}>
                    <div className="mb-4">
                      <label className="block text-sm font-bold text-gray-700 mb-1">Offer Title *</label>
                      <input type="text" className="w-full p-2.5 border rounded-lg focus:outline-none focus:border-[#f5a623]" value={offerTitle} onChange={e => setOfferTitle(e.target.value)} placeholder="e.g. Summer Tool Sale" required />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-bold text-gray-700 mb-1">Discount Code</label>
                      <input type="text" className="w-full p-2.5 border rounded-lg focus:outline-none focus:border-[#f5a623] font-mono uppercase" value={offerCode} onChange={e => setOfferCode(e.target.value.toUpperCase())} placeholder="e.g. SUMMER10" />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-bold text-gray-700 mb-1">Discount % *</label>
                      <input type="number" className="w-full p-2.5 border rounded-lg focus:outline-none focus:border-[#f5a623]" value={offerPercent} onChange={e => setOfferPercent(e.target.value)} min="1" max="99" required />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-bold text-gray-700 mb-1">Applicable Products</label>
                      <div className="border rounded-lg max-h-40 overflow-y-auto p-2 bg-gray-50">
                        {products && products.map(product => (
                          <label key={product._id} className="flex items-center space-x-2 p-1 hover:bg-gray-200 rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedProducts.includes(product._id)}
                              onChange={() => handleProductSelect(product._id)}
                              className="accent-[#f5a623]"
                            />
                            <span className="text-sm truncate" title={product.name}>{product.name}</span>
                          </label>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">Leave all unchecked to apply site-wide.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Valid From *</label>
                        <input type="date" className="w-full p-2.5 border rounded-lg focus:outline-none focus:border-[#f5a623]" value={validFrom} onChange={e => setValidFrom(e.target.value)} required />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Valid Until *</label>
                        <input type="date" className="w-full p-2.5 border rounded-lg focus:outline-none focus:border-[#f5a623]" value={validUntil} onChange={e => setValidUntil(e.target.value)} required />
                      </div>
                    </div>

                    <div className="mb-6 flex items-center gap-2">
                      <input type="checkbox" id="active" className="h-4 w-4 accent-[#f5a623]" checked={isOfferActive} onChange={e => setIsOfferActive(e.target.checked)} />
                      <label htmlFor="active" className="text-sm font-bold text-gray-700">Launch as Active</label>
                    </div>
                    <button type="submit" className="w-full bg-[#f5a623] hover:bg-[#e79d1f] text-black font-bold py-2.5 px-4 rounded-lg transition-colors shadow-sm">Create Offer</button>
                  </form>
                </div>
              </div>

              {/* Offers Table */}
              <div className="lg:col-span-2">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <h2 className="text-lg font-bold mb-4">All Promotions</h2>
                  {offersLoading ? <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f5a623]"></div></div> : offers.length === 0 ? (
                    <div className="text-center py-16">
                      <Tag className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                      <p className="text-gray-400 font-medium">No offers created yet.</p>
                      <p className="text-gray-400 text-sm">Create your first promotion using the form on the left.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Discount</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applies To</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Validity</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {offers.map(offer => (
                            <tr key={offer._id} className="hover:bg-gray-50">
                              <td className="px-4 py-4 font-medium text-gray-900">{offer.title}</td>
                              <td className="px-4 py-4 text-sm font-mono text-gray-500">{offer.discountCode || '—'}</td>
                              <td className="px-4 py-4 text-sm font-bold text-emerald-600">{offer.discountPercent}% OFF</td>
                              <td className="px-4 py-4 text-sm text-gray-600">
                                {offer.applicableProducts?.length > 0 ? `${offer.applicableProducts.length} Products` : 'Site-wide'}
                              </td>
                              <td className="px-4 py-4 text-xs text-gray-500">
                                {new Date(offer.validFrom).toLocaleDateString()} - <br />
                                {new Date(offer.validUntil).toLocaleDateString()}
                              </td>
                              <td className="px-4 py-4">
                                <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${offer.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                  {offer.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="px-4 py-4 text-right space-x-3">
                                <button onClick={() => toggleOfferHandler(offer)} className="text-gray-500 hover:text-gray-700" title={offer.isActive ? 'Deactivate' : 'Activate'}>
                                  {offer.isActive ? <ToggleRight className="h-5 w-5 text-green-600" /> : <ToggleLeft className="h-5 w-5" />}
                                </button>
                                <button onClick={() => deleteOfferHandler(offer._id)} className="text-red-500 hover:text-red-700"><Trash2 className="h-4 w-4" /></button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quote Modal */}
      {showQuoteModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Provide Counter-Offer</h2>
            <form onSubmit={submitQuoteHandler}>
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-1">Quote Price (₹)</label>
                <input
                  type="number"
                  required
                  className="w-full p-2.5 border rounded-lg focus:outline-none focus:border-[#f5a623]"
                  value={quotePrice}
                  onChange={(e) => setQuotePrice(e.target.value)}
                  placeholder="e.g. 50000"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-1">Negotiation Notes (For Customer)</label>
                <textarea
                  className="w-full p-2.5 border rounded-lg focus:outline-none focus:border-[#f5a623] h-24"
                  value={quoteNotes}
                  onChange={(e) => setQuoteNotes(e.target.value)}
                  placeholder="e.g. Added a 5% bulk discount for this order."
                ></textarea>
              </div>
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setShowQuoteModal(false); setIsSalesCounterMode(false); }}
                  className="px-4 py-2 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-bold bg-[#f5a623] text-slate-900 rounded-lg hover:bg-[#e79d1f]"
                >
                  Send Quote
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default SalesDashboard;
