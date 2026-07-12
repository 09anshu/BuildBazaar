import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import socket from '../utils/socket';
import { Package, ChevronRight, ShoppingBag, XCircle, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import getImageUrl from '../utils/getImageUrl';

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnOrderId, setReturnOrderId] = useState(null);
  const [returnItemId, setReturnItemId] = useState(null);
  const [returnReason, setReturnReason] = useState('');
  const [returnLoading, setReturnLoading] = useState(false);
  const [showCounterModal, setShowCounterModal] = useState(false);
  const [counterOrderId, setCounterOrderId] = useState(null);
  const [counterPrice, setCounterPrice] = useState('');
  const [counterNotes, setCounterNotes] = useState('');
  const [counterLoading, setCounterLoading] = useState(false);

  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      const { data } = await axios.get('/api/orders/myorders', config);
      setOrders(data);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    } else {
      fetchOrders();
    }
  }, [navigate, userInfo]);

  // Real-time updates: quote updates and order status changes
  useEffect(() => {
    if (!userInfo) return;

    const onQuoteUpdated = (updatedOrder) => {
      if (!updatedOrder) return;
      if (updatedOrder.user && updatedOrder.user.toString() === userInfo._id.toString()) {
        fetchOrders();
        toast.info('A quote has been updated.');
      }
    };

    const onOrderStatusChanged = (updatedOrder) => {
      if (!updatedOrder) return;
      if (updatedOrder.user && updatedOrder.user.toString() === userInfo._id.toString()) {
        fetchOrders();
        toast.info('Order status updated.');
      }
    };

    const onQuoteStatusChanged = (updatedOrder) => {
      if (!updatedOrder) return;
      if (updatedOrder.user && updatedOrder.user.toString() === userInfo._id.toString()) {
        fetchOrders();
        // Show specific toast based on enquiryStatus
        if (updatedOrder.enquiryStatus === 'rejected') {
          toast.error('Your enquiry has been declined by sales.');
        } else if (updatedOrder.enquiryStatus === 'accepted') {
          toast.success('Your quote has been accepted!');
        }
      }
    };

    socket.on('quoteUpdated', onQuoteUpdated);
    socket.on('orderStatusChanged', onOrderStatusChanged);
    socket.on('quoteStatusChanged', onQuoteStatusChanged);

    return () => {
      socket.off('quoteUpdated', onQuoteUpdated);
      socket.off('orderStatusChanged', onOrderStatusChanged);
      socket.off('quoteStatusChanged', onQuoteStatusChanged);
    };
  }, [userInfo]);

  const acceptQuoteHandler = async (orderId) => {
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.put(`/api/orders/${orderId}/accept-quote`, {}, config);
      toast.success('Quote Accepted!');
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to accept this quote right now. Please refresh and try again.');
    }
  };

  const handleReturnClick = (orderId, productId) => {
    setReturnOrderId(orderId);
    setReturnItemId(productId);
    setShowReturnModal(true);
  };

  const submitReturnRequest = async (e) => {
    e.preventDefault();
    if (!returnReason.trim()) {
      toast.error('Please provide a reason for return');
      return;
    }

    setReturnLoading(true);
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      await axios.put(`/api/orders/${returnOrderId}/return-item`, {
        productId: returnItemId,
        reason: returnReason
      }, config);

      toast.success('Return requested successfully');
      setShowReturnModal(false);
      setReturnReason('');

      // Update local state to reflect requested status
      setOrders(prevOrders => prevOrders.map(order => {
        if (order._id === returnOrderId) {
          return {
            ...order,
            orderItems: order.orderItems.map(item => {
              if (item.product === returnItemId) {
                return { ...item, returnStatus: 'requested' };
              }
              return item;
            })
          };
        }
        return order;
      }));
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setReturnLoading(false);
    }
  };

  // Helper to determine the display status for an order
  const getOrderDisplay = (order) => {
    if (order.orderType === 'enquiry') {
      switch (order.enquiryStatus) {
        case 'pending':
          return {
            dotColor: 'bg-gray-400',
            title: 'Quote Pending Review',
            headerLabel: 'Quote Requested',
            icon: Clock,
            iconColor: 'text-gray-500',
          };
        case 'quoted':
          return {
            dotColor: 'bg-amber-500',
            title: 'Quote Ready — Action Required',
            headerLabel: 'Quote Received',
            icon: AlertTriangle,
            iconColor: 'text-amber-600',
          };
        case 'countered':
          return {
            dotColor: 'bg-blue-500',
            title: 'Counter Offer Under Review',
            headerLabel: 'Counter Proposed',
            icon: Clock,
            iconColor: 'text-blue-600',
          };
        case 'accepted':
          return {
            dotColor: 'bg-green-500',
            title: 'Quote Accepted & Processing',
            headerLabel: 'Quote Accepted',
            icon: CheckCircle2,
            iconColor: 'text-green-600',
          };
        case 'rejected':
          return {
            dotColor: 'bg-red-500',
            title: 'Enquiry Rejected / Cancelled',
            headerLabel: 'Enquiry Rejected',
            icon: XCircle,
            iconColor: 'text-red-600',
          };
        default:
          return {
            dotColor: 'bg-gray-400',
            title: 'Status Unknown',
            headerLabel: 'Quote Requested',
            icon: Clock,
            iconColor: 'text-gray-500',
          };
      }
    }

    // Standard order
    return {
      dotColor: order.isDelivered ? 'bg-green-500' : 'bg-orange-500',
      title: order.isDelivered ? 'Delivered' : 'Arriving Soon',
      headerLabel: 'Order Placed',
      icon: order.isDelivered ? CheckCircle2 : Package,
      iconColor: order.isDelivered ? 'text-green-600' : 'text-orange-500',
    };
  };

  // Whether the customer can still take action on this enquiry
  const isEnquiryActionable = (order) => {
    return order.orderType === 'enquiry' &&
      (order.enquiryStatus === 'quoted' || order.enquiryStatus === 'countered');
  };

  if (!userInfo) return null;

  return (
    <div className="bg-gray-100 min-h-screen pt-10 px-4 pb-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Your Orders</h1>

        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amazon_blue"></div></div>
        ) : orders.length === 0 ? (
          <div className="bg-white p-20 rounded-md shadow-sm border border-gray-200 text-center flex flex-col items-center">
            <ShoppingBag className="h-20 w-20 text-gray-200 mb-6" />
            <h2 className="text-2xl font-bold mb-4 text-gray-700">No orders yet</h2>
            <p className="text-gray-500 mb-8 max-w-sm">You haven't placed any orders with us. Start building your project today!</p>
            <Link to="/" className="bg-amazon_yellow text-black font-bold py-3 px-8 rounded-md hover:bg-yellow-500 shadow-sm transition-colors">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const display = getOrderDisplay(order);
              const isRejected = order.orderType === 'enquiry' && order.enquiryStatus === 'rejected';

              return (
                <div key={order._id} className={`bg-white rounded-md shadow-sm border overflow-hidden ${isRejected ? 'border-red-200' : 'border-gray-200'}`}>
                  <div className={`p-4 border-b flex flex-wrap justify-between items-center text-xs font-bold uppercase tracking-wider ${isRejected ? 'bg-red-50 border-red-200 text-red-700' : 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                    <div className="flex space-x-8">
                      <div>
                        <p>{display.headerLabel}</p>
                        <p className={`font-normal ${isRejected ? 'text-red-600' : 'text-gray-800'}`}>{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p>Total</p>
                        <p className={`font-normal ${isRejected ? 'text-red-600' : 'text-gray-800'}`}>
                          {order.orderType === 'enquiry' && order.enquiryStatus === 'pending'
                            ? 'Pending Quote'
                            : `₹${order.totalPrice.toLocaleString('en-IN')}`}
                        </p>
                      </div>
                      <div>
                        <p>Requested By</p>
                        <p className="font-normal text-blue-600 hover:underline cursor-pointer">{userInfo.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p>{order.orderType === 'enquiry' ? 'Quote #' : 'Order #'} {order._id}</p>
                      <Link to={`/order/${order._id}`} className="text-blue-600 hover:underline lowercase font-normal">
                        {order.orderType === 'enquiry' ? 'View quote details' : 'View order details'}
                      </Link>
                    </div>
                  </div>

                  <div className="p-6">
                    {/* Status Indicator */}
                    <div className="flex items-center mb-6">
                      <div className={`h-3 w-3 rounded-full mr-3 ${display.dotColor}`}></div>
                      <h3 className={`text-lg font-bold ${isRejected ? 'text-red-700' : ''}`}>
                        {display.title}
                      </h3>
                    </div>

                    {/* Rejected Banner */}
                    {isRejected && (
                      <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200 flex items-start gap-3">
                        <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-bold text-red-800 text-sm">This enquiry has been rejected by the sales team.</h4>
                          <p className="text-sm text-red-600 mt-1">
                            The sales team was unable to proceed with this enquiry.
                            {order.negotiationNotes && (
                              <span> <strong>Reason:</strong> "{order.negotiationNotes}"</span>
                            )}
                          </p>
                          <p className="text-xs text-red-500 mt-2">You can submit a new enquiry if you'd like to try again with different requirements.</p>
                        </div>
                      </div>
                    )}

                    <div className="space-y-6">
                      {order.orderItems.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <div className="flex items-center space-x-6">
                            <img
                              src={getImageUrl(item.image)}
                              alt={item.name}
                              className={`h-20 w-20 object-contain ${isRejected ? 'opacity-50' : ''}`}
                            />
                            <div>
                              <Link to={`/product/${item.product}`} className="text-blue-600 hover:underline font-medium line-clamp-1 max-w-md">
                                {item.name}
                              </Link>
                              <p className="text-xs text-gray-500 mt-1">Quantity: {item.qty}</p>
                              <div className="mt-4 flex space-x-4">
                                {order.orderType === 'enquiry' ? (
                                  isRejected ? (
                                    <button
                                      onClick={() => navigate(`/product/${item.product}`)}
                                      className="bg-amazon_yellow text-black text-xs font-bold py-2 px-4 rounded-md hover:bg-yellow-500 shadow-sm"
                                    >
                                      Create New Enquiry
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => navigate(`/order/${order._id}`)}
                                      className="bg-amber-400 text-slate-900 text-xs font-bold py-2 px-4 rounded-md hover:bg-amber-500 shadow-sm"
                                    >
                                      View Quote
                                    </button>
                                  )
                                ) : (
                                  <>
                                    <button
                                      onClick={() => navigate(`/product/${item.product}`)}
                                      className="bg-amazon_yellow text-black text-xs font-bold py-2 px-4 rounded-md hover:bg-yellow-500 shadow-sm"
                                    >
                                      Buy it again
                                    </button>
                                    <button className="bg-white border border-gray-300 text-black text-xs font-bold py-2 px-4 rounded-md hover:bg-gray-50 shadow-sm">
                                      Track package
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="hidden md:block text-right">
                            {!isRejected && order.orderType !== 'enquiry' && (
                              <>
                                <Link to={`/product/${item.product}/review`} className="text-sm text-blue-600 hover:underline block mb-2">Write a product review</Link>
                                {item.returnStatus && item.returnStatus !== 'none' ? (
                                  <span className="text-sm font-semibold text-amber-600">
                                    Return {item.returnStatus.charAt(0).toUpperCase() + item.returnStatus.slice(1)}
                                  </span>
                                ) : (
                                  <button onClick={() => handleReturnClick(order._id, item.product)} className="text-sm text-blue-600 hover:underline">
                                    Return or replace items
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Quote Review Section — only for quoted status (not rejected) */}
                    {order.orderType === 'enquiry' && order.enquiryStatus === 'quoted' && (
                      <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                        <h4 className="font-bold text-amber-800 mb-2">Quote Offer Received</h4>
                        <p className="text-sm text-gray-700 mb-1"><strong>Quoted Price:</strong> <span className="font-black text-emerald-700">₹{order.totalPrice.toLocaleString('en-IN')}</span></p>
                        {order.negotiationNotes && (
                          <p className="text-sm text-gray-700 italic mb-4 mt-2"><strong>Sales Notes:</strong> "{order.negotiationNotes}"</p>
                        )}
                        <div className="mt-4 flex gap-3">
                          <button
                            onClick={() => acceptQuoteHandler(order._id)}
                            disabled={!userInfo?.token}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold py-2 px-6 rounded-md shadow-sm transition-colors"
                          >
                            Accept Quote
                          </button>
                          <button
                            onClick={() => { setCounterOrderId(order._id); setShowCounterModal(true); }}
                            className="bg-white border border-amber-400 text-amber-700 text-sm font-bold py-2 px-4 rounded-md shadow-sm hover:bg-amber-50"
                          >
                            Propose Counter
                          </button>
                          <p className="text-xs text-gray-500 self-center">Accepting will move this to a standard order.</p>
                        </div>
                      </div>
                    )}

                    {/* Counter Offer Section — only for countered status (not rejected) */}
                    {order.orderType === 'enquiry' && order.enquiryStatus === 'countered' && (
                      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="font-bold text-blue-800 mb-2">Counter Offer Under Review</h4>
                        <p className="text-sm text-gray-700 mb-1"><strong>Counter Price:</strong> <span className="font-black text-blue-700">₹{(order.counterPrice || 0).toLocaleString('en-IN')}</span></p>
                        {order.negotiationNotes && (
                          <p className="text-sm text-gray-700 italic mb-2"><strong>Notes:</strong> "{order.negotiationNotes}"</p>
                        )}
                        <div className="mt-4 flex gap-3">
                          <button
                            onClick={() => acceptQuoteHandler(order._id)}
                            disabled={!userInfo?.token}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold py-2 px-6 rounded-md shadow-sm transition-colors"
                          >
                            Accept Counter
                          </button>
                          <button
                            onClick={() => { setCounterOrderId(order._id); setCounterPrice(order.counterPrice || ''); setCounterNotes(order.negotiationNotes || ''); setShowCounterModal(true); }}
                            className="bg-white border border-blue-400 text-blue-700 text-sm font-bold py-2 px-4 rounded-md shadow-sm hover:bg-blue-50"
                          >
                            Propose Another
                          </button>
                          <p className="text-xs text-gray-500 self-center">Accepting will move this to a standard order.</p>
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showReturnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-gray-50 p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Return or Replace Item</h3>
            </div>
            <form onSubmit={submitReturnRequest} className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">Why are you returning this?</label>
                <textarea
                  rows="3"
                  required
                  placeholder="e.g. Item is damaged, changed my mind, etc."
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-amber-400 outline-none"
                ></textarea>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowReturnModal(false)}
                  className="flex-1 py-3 rounded-lg font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={returnLoading}
                  className="flex-1 py-3 rounded-lg font-bold text-slate-900 bg-amber-400 hover:bg-amber-500 transition-colors flex justify-center items-center"
                >
                  {returnLoading ? <div className="h-5 w-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div> : 'Submit Return'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showCounterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-gray-50 p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Propose Counter Offer</h3>
            </div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              setCounterLoading(true);
              try {
                const config = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userInfo.token}` } };
                const payload = { counterPrice: counterPrice ? Number(counterPrice) : undefined, counterNotes };
                await axios.put(`/api/orders/${counterOrderId}/counter`, payload, config);
                toast.success('Counter proposed to Sales');
                fetchOrders();
                setShowCounterModal(false);
                setCounterPrice('');
                setCounterNotes('');
              } catch (err) {
                toast.error(err.response?.data?.message || 'Error proposing counter');
              } finally {
                setCounterLoading(false);
              }
            }} className="p-6">
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-1">Counter Price (₹)</label>
                <input type="number" required value={counterPrice} onChange={(e) => setCounterPrice(e.target.value)} className="w-full p-2.5 border rounded-lg focus:outline-none focus:border-[#f5a623]" />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-1">Notes (optional)</label>
                <textarea value={counterNotes} onChange={(e) => setCounterNotes(e.target.value)} className="w-full p-2.5 border rounded-lg focus:outline-none focus:border-[#f5a623] h-24" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowCounterModal(false)} className="flex-1 py-3 rounded-lg font-bold text-gray-600 bg-gray-100 hover:bg-gray-200">Cancel</button>
                <button type="submit" disabled={counterLoading} className="flex-1 py-3 rounded-lg font-bold text-slate-900 bg-amber-400 hover:bg-amber-500">
                  {counterLoading ? 'Sending...' : 'Send Counter'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrdersPage;
