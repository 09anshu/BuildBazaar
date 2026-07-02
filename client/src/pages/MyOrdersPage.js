import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Package, ChevronRight, ShoppingBag } from 'lucide-react';

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnOrderId, setReturnOrderId] = useState(null);
  const [returnItemId, setReturnItemId] = useState(null);
  const [returnReason, setReturnReason] = useState('');
  const [returnLoading, setReturnLoading] = useState(false);

  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    } else {
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
      fetchOrders();
    }
  }, [navigate, userInfo]);

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
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-50 p-4 border-b border-gray-200 flex flex-wrap justify-between items-center text-xs text-gray-600 font-bold uppercase tracking-wider">
                  <div className="flex space-x-8">
                    <div>
                      <p>{order.orderType === 'enquiry' ? 'Quote Requested' : 'Order Placed'}</p>
                      <p className="font-normal text-gray-800">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p>Total</p>
                      <p className="font-normal text-gray-800">
                        {order.orderType === 'enquiry' && order.enquiryStatus === 'pending' 
                          ? 'Pending Quote' 
                          : `₹${order.totalPrice.toLocaleString('en-IN')}`}
                      </p>
                    </div>
                    <div>
                      <p>Requested By</p>
                      <p className="font-normal text-gray-800 text-blue-600 hover:underline cursor-pointer">{userInfo.name}</p>
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
                  <div className="flex items-center mb-6">
                    <div className={`h-3 w-3 rounded-full mr-3 ${
                      order.orderType === 'enquiry' 
                        ? (order.enquiryStatus === 'quoted' ? 'bg-amber-500' : order.enquiryStatus === 'accepted' ? 'bg-green-500' : 'bg-gray-400')
                        : (order.isDelivered ? 'bg-green-500' : 'bg-orange-500')
                    }`}></div>
                    <h3 className="text-lg font-bold">
                      {order.orderType === 'enquiry' 
                        ? (order.enquiryStatus === 'pending' ? 'Quote Pending Review' 
                           : order.enquiryStatus === 'quoted' ? 'Quote Ready - Action Required' 
                           : order.enquiryStatus === 'accepted' ? 'Quote Accepted & Processing' 
                           : 'Quote Rejected')
                        : (order.isDelivered ? 'Delivered' : 'Arriving Soon')}
                    </h3>
                  </div>

                  <div className="space-y-6">
                    {order.orderItems.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <div className="flex items-center space-x-6">
                          <img 
                            src={item.image?.startsWith('http') ? item.image : `http://localhost:5000${item.image}`} 
                            alt={item.name} 
                            className="h-20 w-20 object-contain"
                          />
                          <div>
                            <Link to={`/product/${item.product}`} className="text-blue-600 hover:underline font-medium line-clamp-1 max-w-md">
                              {item.name}
                            </Link>
                            <p className="text-xs text-gray-500 mt-1">Quantity: {item.qty}</p>
                            <div className="mt-4 flex space-x-4">
                              {order.orderType === 'enquiry' ? (
                                <button 
                                  onClick={() => navigate(`/order/${order._id}`)}
                                  className="bg-amber-400 text-slate-900 text-xs font-bold py-2 px-4 rounded-md hover:bg-amber-500 shadow-sm"
                                >
                                  View Quote
                                </button>
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
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
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
    </div>
  );
};

export default MyOrdersPage;
