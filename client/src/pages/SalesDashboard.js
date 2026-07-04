import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { fetchOffers, createOffer, deleteOffer, updateOffer } from '../store/slices/offerSlice';
import { Tag, FileText, Plus, Trash2, ToggleLeft, ToggleRight, TrendingUp, MessageSquare, IndianRupee } from 'lucide-react';

const SalesDashboard = () => {
  const [activeTab, setActiveTab] = useState('quotes');
  const [enquiries, setEnquiries] = useState([]);
  const [loadingQuotes, setLoadingQuotes] = useState(false);

  // Offer Form State
  const [offerTitle, setOfferTitle] = useState('');
  const [offerCode, setOfferCode] = useState('');
  const [offerPercent, setOfferPercent] = useState('');
  const [isOfferActive, setIsOfferActive] = useState(true);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { userInfo } = useSelector((state) => state.auth);
  const { offers, loading: offersLoading } = useSelector((state) => state.offers);

  useEffect(() => {
    if (!userInfo || (userInfo.role !== 'sales' && userInfo.role !== 'admin')) {
      navigate('/login');
    } else {
      fetchEnquiries();
      dispatch(fetchOffers());
    }
  }, [navigate, userInfo, dispatch]);

  const fetchEnquiries = async () => {
    setLoadingQuotes(true);
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const { data } = await axios.get('/api/orders', config);
      const filtered = data.filter(order => order.orderType === 'enquiry');
      setEnquiries(filtered);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error fetching quotes');
    } finally {
      setLoadingQuotes(false);
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
      isActive: isOfferActive
    })).then(() => {
      setOfferTitle('');
      setOfferCode('');
      setOfferPercent('');
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

  // Stats
  const pendingCount = enquiries.filter(e => e.enquiryStatus === 'pending').length;
  const quotedCount = enquiries.filter(e => e.enquiryStatus === 'quoted').length;
  const acceptedCount = enquiries.filter(e => e.enquiryStatus === 'accepted').length;
  const activeOffers = offers.filter(o => o.isActive).length;

  const statusColors = {
    pending: { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-300', dot: 'bg-gray-400', label: 'New Requests' },
    quoted: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-300', dot: 'bg-amber-500', label: 'Quote Sent' },
    accepted: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-300', dot: 'bg-emerald-500', label: 'Closed / Won' },
    rejected: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-300', dot: 'bg-red-500', label: 'Rejected' },
  };

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
          <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-[#f5a623]">
            <p className="text-xs font-bold text-gray-500 uppercase">Active Offers</p>
            <p className="text-2xl font-black text-gray-800 mt-1">{activeOffers}</p>
          </div>
        </div>

        {/* ===== QUOTES TAB ===== */}
        {activeTab === 'quotes' && (
          <div>
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Quote Kanban Board</h1>
            {loadingQuotes ? (
              <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f5a623]"></div></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {['pending', 'quoted', 'accepted', 'rejected'].map(status => {
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
                          <p className="text-[10px] text-gray-400 font-mono mb-1">#{enq._id.substring(0, 8)}</p>
                          <p className="font-bold text-sm text-gray-800 mb-1">{enq.user?.name || 'Unknown User'}</p>
                          <p className="text-xs text-gray-500 mb-2">{enq.orderItems.length} item{enq.orderItems.length > 1 ? 's' : ''} requested</p>
                          {enq.customNotes && <p className="text-xs text-gray-400 italic truncate mb-2">"{enq.customNotes}"</p>}
                          {enq.totalPrice > 0 && (
                            <p className="text-sm font-bold text-emerald-600 flex items-center"><IndianRupee className="h-3 w-3 mr-0.5" />{enq.totalPrice.toLocaleString('en-IN')}</p>
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
    </div>
  );
};

export default SalesDashboard;
