import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Search, Package, Users, CheckCircle, Clock, Headphones, AlertCircle, RefreshCw } from 'lucide-react';

const SupportDashboard = () => {
  const [activeTab, setActiveTab] = useState('orders');
  const [searchTerm, setSearchTerm] = useState('');
  const [allUsers, setAllUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    if (!userInfo || (userInfo.role !== 'support' && userInfo.role !== 'admin')) {
      navigate('/login');
    } else {
      fetchData();
    }
  }, [navigate, userInfo]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const [usersRes, ordersRes] = await Promise.all([
        axios.get('/api/users', config),
        axios.get('/api/orders', config),
      ]);
      setAllUsers(usersRes.data);
      setFilteredUsers(usersRes.data);
      setOrders(ordersRes.data.filter(order => order.orderType !== 'enquiry'));
    } catch (error) {
      toast.error('Error fetching data');
    } finally {
      setLoading(false);
    }
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

  const markAsDelivered = async (orderId) => {
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.put(`/api/orders/${orderId}/deliver`, {}, config);
      toast.success('Order marked as delivered');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error updating order status');
    }
  };

  // Stats
  const pendingDeliveries = orders.filter(o => !o.isDelivered).length;
  const deliveredOrders = orders.filter(o => o.isDelivered).length;
  const paidOrders = orders.filter(o => o.isPaid).length;
  const totalCustomers = allUsers.filter(u => u.role === 'customer').length;

  return (
    <div className="bg-gray-100 min-h-screen flex">
      {/* Sidebar */}
      <div className="w-64 bg-[#0f1117] text-white p-6 hidden md:flex flex-col">
        <div className="flex items-center gap-2 mb-10">
          <Headphones className="h-6 w-6 text-blue-400" />
          <h2 className="text-xl font-bold text-blue-400">Support Panel</h2>
        </div>
        <nav className="space-y-2 flex-grow">
          <button onClick={() => setActiveTab('orders')} className={`w-full text-left p-3 rounded-lg flex items-center transition-all duration-200 ${activeTab === 'orders' ? 'bg-blue-500 text-white font-bold shadow-lg shadow-blue-500/20' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
            <Package className="h-5 w-5 mr-3" /> Order Tracking
          </button>
          <button onClick={() => setActiveTab('users')} className={`w-full text-left p-3 rounded-lg flex items-center transition-all duration-200 ${activeTab === 'users' ? 'bg-blue-500 text-white font-bold shadow-lg shadow-blue-500/20' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
            <Users className="h-5 w-5 mr-3" /> User Lookup
          </button>
        </nav>
        <div className="border-t border-white/10 pt-4 mt-4">
          <p className="text-xs text-white/40 mb-1">Logged in as</p>
          <p className="text-sm font-bold text-blue-400">{userInfo?.name}</p>
          <p className="text-xs text-white/50 uppercase">{userInfo?.role}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow p-8 overflow-y-auto">
        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-orange-500">
            <p className="text-xs font-bold text-gray-500 uppercase">Pending Deliveries</p>
            <p className="text-2xl font-black text-gray-800 mt-1">{pendingDeliveries}</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-emerald-500">
            <p className="text-xs font-bold text-gray-500 uppercase">Delivered</p>
            <p className="text-2xl font-black text-gray-800 mt-1">{deliveredOrders}</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-blue-500">
            <p className="text-xs font-bold text-gray-500 uppercase">Paid Orders</p>
            <p className="text-2xl font-black text-gray-800 mt-1">{paidOrders}</p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border-l-4 border-purple-500">
            <p className="text-xs font-bold text-gray-500 uppercase">Total Customers</p>
            <p className="text-2xl font-black text-gray-800 mt-1">{totalCustomers}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div></div>
        ) : (
          <>
            {/* ===== ORDER TRACKING TAB ===== */}
            {activeTab === 'orders' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl font-bold text-gray-800">Order Tracking & Fulfillment</h1>
                  <button onClick={fetchData} className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-800">
                    <RefreshCw className="h-4 w-4" /> Refresh
                  </button>
                </div>
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                        <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Delivery</th>
                        <th className="px-5 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {orders.map(order => (
                        <tr key={order._id} className="hover:bg-gray-50">
                          <td className="px-5 py-4 whitespace-nowrap text-sm font-mono text-blue-600 hover:underline cursor-pointer" onClick={() => navigate(`/order/${order._id}`)}>
                            #{order._id.substring(0, 8)}
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-800">{order.user?.name || 'Unknown'}</td>
                          <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                          <td className="px-5 py-4 whitespace-nowrap text-sm font-bold text-gray-900">₹{order.totalPrice.toLocaleString('en-IN')}</td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            {order.isPaid ? (
                              <span className="flex items-center text-emerald-600 text-xs font-bold"><CheckCircle className="h-3.5 w-3.5 mr-1" /> Paid</span>
                            ) : (
                              <span className="flex items-center text-red-500 text-xs font-bold"><AlertCircle className="h-3.5 w-3.5 mr-1" /> Unpaid</span>
                            )}
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap">
                            {order.isDelivered ? (
                              <span className="flex items-center text-emerald-600 text-xs font-bold"><CheckCircle className="h-3.5 w-3.5 mr-1" /> Delivered</span>
                            ) : (
                              <span className="flex items-center text-orange-500 text-xs font-bold"><Clock className="h-3.5 w-3.5 mr-1" /> Processing</span>
                            )}
                          </td>
                          <td className="px-5 py-4 whitespace-nowrap text-right">
                            {!order.isDelivered ? (
                              <button onClick={() => markAsDelivered(order._id)} className="bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold py-1.5 px-4 rounded-lg transition-colors shadow-sm">
                                Mark Delivered
                              </button>
                            ) : (
                              <span className="text-xs text-gray-400 font-medium">Completed</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {orders.length === 0 && (
                    <div className="text-center py-16">
                      <Package className="h-12 w-12 text-gray-200 mx-auto mb-4" />
                      <p className="text-gray-400 font-medium">No standard orders found.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ===== USER LOOKUP TAB ===== */}
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
          </>
        )}
      </div>
    </div>
  );
};

export default SupportDashboard;
