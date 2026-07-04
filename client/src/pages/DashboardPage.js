import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Package, ShoppingBag, Users, TrendingUp, X, Shield, BarChart3, Eye, UserCog, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [sellerProducts, setSellerProducts] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddUserForm, setShowAddUserForm] = useState(false);

  // User Form State
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('customer');

  // Form State
  const [name, setName] = useState('');
  const [price, setPrice] = useState(0);
  const [image, setImage] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [countInStock, setCountInStock] = useState(0);
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);

  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userInfo || (userInfo.role !== 'admin' && userInfo.role !== 'seller')) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [userInfo, navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      if (userInfo.role === 'admin') {
        const [usersRes, ordersRes, prodsRes] = await Promise.all([
          axios.get('/api/users', config),
          axios.get('/api/orders', config),
          axios.get('/api/products', config),
        ]);
        setAllUsers(usersRes.data);
        setAllOrders(ordersRes.data);
        setSellerProducts(prodsRes.data.products);
      } else if (userInfo.role === 'seller') {
        const { data: prods } = await axios.get('/api/products/seller', config);
        setSellerProducts(prods);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('image', file);
    setUploading(true);
    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data' } };
      const { data } = await axios.post('/api/upload', formData, config);
      setImage(data);
    } catch (error) {
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userInfo.token}` } };
      await axios.post('/api/products', { name, price, image, brand, category, countInStock, description }, config);
      toast.success('Product created');
      setShowAddForm(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const deleteHandler = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        await axios.delete(`/api/products/${id}`, config);
        setSellerProducts(sellerProducts.filter((p) => p._id !== id));
        toast.success('Product deleted');
      } catch (error) {
        toast.error(error.response?.data?.message || error.message);
      }
    }
  };

  const deliverHandler = async (id) => {
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.put(`/api/orders/${id}/deliver`, {}, config);
      toast.success('Order marked as delivered');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const updateRoleHandler = async (userId, newRole) => {
    try {
      const config = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userInfo.token}` } };
      await axios.put(`/api/users/${userId}`, { role: newRole }, config);
      setAllUsers(allUsers.map(u => u._id === userId ? { ...u, role: newRole } : u));
      toast.success(`Role updated to ${newRole}`);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  const deleteUserHandler = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        await axios.delete(`/api/users/${userId}`, config);
        setAllUsers(allUsers.filter(u => u._id !== userId));
        toast.success('User deleted');
      } catch (error) {
        toast.error(error.response?.data?.message || error.message);
      }
    }
  };

  const createUserHandler = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${userInfo.token}` } };
      await axios.post('/api/users', { name: newUserName, email: newUserEmail, password: newUserPassword, role: newUserRole }, config);
      toast.success('User created successfully');
      setShowAddUserForm(false);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserRole('customer');
      fetchData(); // Refresh user list
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  // Computed stats
  const totalRevenue = allOrders.filter(o => o.isPaid).reduce((sum, o) => sum + o.totalPrice, 0);
  const pendingOrders = allOrders.filter(o => !o.isDelivered).length;
  const enquiries = allOrders.filter(o => o.orderType === 'enquiry');
  const salesTeam = allUsers.filter(u => u.role === 'sales');
  const supportTeam = allUsers.filter(u => u.role === 'support');

  const sidebarItems = [
    { key: 'overview', label: 'Overview', icon: BarChart3 },
    { key: 'products', label: 'Products', icon: Package },
    { key: 'orders', label: 'Orders', icon: ShoppingBag },
    ...(userInfo?.role === 'admin' ? [{ key: 'users', label: 'Users & Roles', icon: UserCog }] : []),
    ...(userInfo?.role === 'admin' ? [{ key: 'teams', label: 'Team Monitor', icon: Eye }] : []),
  ];

  return (
    <div className="bg-gray-100 min-h-screen flex">
      {/* Sidebar */}
      <div className="w-64 bg-[#0f1117] text-white p-6 hidden md:flex flex-col">
        <div className="flex items-center gap-2 mb-10">
          <Shield className="h-6 w-6 text-[#f5a623]" />
          <h2 className="text-xl font-bold text-[#f5a623]">Admin Panel</h2>
        </div>
        <nav className="space-y-2 flex-grow">
          {sidebarItems.map(item => {
            const Icon = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`w-full text-left p-3 rounded-lg flex items-center transition-all duration-200 ${
                  activeTab === item.key
                    ? 'bg-[#f5a623] text-[#0f1117] font-bold shadow-lg shadow-[#f5a623]/20'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="border-t border-white/10 pt-4 mt-4">
          <p className="text-xs text-white/40 mb-1">Logged in as</p>
          <p className="text-sm font-bold text-[#f5a623]">{userInfo?.name}</p>
          <p className="text-xs text-white/50 uppercase">{userInfo?.role}</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow p-8 overflow-y-auto">
        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f5a623]"></div></div>
        ) : (
          <>
            {/* ===== OVERVIEW TAB ===== */}
            {activeTab === 'overview' && (
              <div>
                <h1 className="text-3xl font-bold mb-8 text-gray-800">Dashboard Overview</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                  <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-[#f5a623]">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Total Revenue</p>
                    <p className="text-2xl font-black text-gray-800">₹{totalRevenue.toLocaleString('en-IN')}</p>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-blue-500">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Pending Orders</p>
                    <p className="text-2xl font-black text-gray-800">{pendingOrders}</p>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-emerald-500">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Total Products</p>
                    <p className="text-2xl font-black text-gray-800">{sellerProducts.length}</p>
                  </div>
                  <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-purple-500">
                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">Registered Users</p>
                    <p className="text-2xl font-black text-gray-800">{allUsers.length}</p>
                  </div>
                </div>

                {/* Quick Access to Sub-Dashboards */}
                {userInfo?.role === 'admin' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                    <Link to="/sales/dashboard" className="group bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 flex items-center justify-between hover:shadow-lg transition-all">
                      <div>
                        <p className="text-lg font-bold text-gray-800">Sales Dashboard</p>
                        <p className="text-sm text-gray-500 mt-1">{enquiries.length} active enquiries · {salesTeam.length} team members</p>
                      </div>
                      <ChevronRight className="h-6 w-6 text-[#f5a623] group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link to="/support/dashboard" className="group bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 flex items-center justify-between hover:shadow-lg transition-all">
                      <div>
                        <p className="text-lg font-bold text-gray-800">Support Dashboard</p>
                        <p className="text-sm text-gray-500 mt-1">{pendingOrders} pending deliveries · {supportTeam.length} team members</p>
                      </div>
                      <ChevronRight className="h-6 w-6 text-blue-500 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                )}

                {/* Recent Orders */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-lg font-bold mb-4 text-gray-800">Recent Orders</h2>
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-gray-500 uppercase text-xs font-bold">
                      <tr><th className="p-3">Order ID</th><th className="p-3">Date</th><th className="p-3">Total</th><th className="p-3">Paid</th><th className="p-3">Delivered</th></tr>
                    </thead>
                    <tbody className="divide-y">
                      {allOrders.slice(0, 5).map(order => (
                        <tr key={order._id} className="hover:bg-gray-50">
                          <td className="p-3 font-mono text-xs">{order._id.substring(0, 12)}...</td>
                          <td className="p-3">{new Date(order.createdAt).toLocaleDateString()}</td>
                          <td className="p-3 font-bold">₹{order.totalPrice.toLocaleString('en-IN')}</td>
                          <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${order.isPaid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{order.isPaid ? 'Yes' : 'No'}</span></td>
                          <td className="p-3"><span className={`px-2 py-0.5 rounded-full text-xs font-bold ${order.isDelivered ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>{order.isDelivered ? 'Yes' : 'No'}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ===== PRODUCTS TAB ===== */}
            {activeTab === 'products' && (
              <div>
                <div className="flex justify-between items-center mb-8">
                  <h1 className="text-3xl font-bold text-gray-800">Products</h1>
                  <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="bg-[#f5a623] text-black font-bold py-2 px-4 rounded-lg flex items-center hover:bg-[#e79d1f] shadow-sm transition-colors"
                  >
                    {showAddForm ? <X className="h-5 w-5 mr-2" /> : <Plus className="h-5 w-5 mr-2" />}
                    {showAddForm ? 'Cancel' : 'Add Product'}
                  </button>
                </div>

                {showAddForm && (
                  <div className="bg-white p-8 rounded-xl shadow-sm mb-8 border border-[#f5a623]/20">
                    <h2 className="text-xl font-bold mb-6">Create New Product</h2>
                    <form onSubmit={submitHandler} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-bold mb-2">Product Name</label>
                        <input type="text" className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#f5a623]" value={name} onChange={(e) => setName(e.target.value)} required />
                      </div>
                      <div>
                        <label className="block text-sm font-bold mb-2">Price (₹)</label>
                        <input type="number" className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#f5a623]" value={price} onChange={(e) => setPrice(Number(e.target.value))} required />
                      </div>
                      <div>
                        <label className="block text-sm font-bold mb-2">Brand</label>
                        <input type="text" className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#f5a623]" value={brand} onChange={(e) => setBrand(e.target.value)} required />
                      </div>
                      <div>
                        <label className="block text-sm font-bold mb-2">Category</label>
                        <select className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#f5a623]" value={category} onChange={(e) => setCategory(e.target.value)} required>
                          <option value="">Select Category</option>
                          <option value="Cement">Cement</option>
                          <option value="Steel">Steel</option>
                          <option value="Tools">Tools</option>
                          <option value="Machinery">Machinery</option>
                          <option value="Safety">Safety</option>
                          <option value="Electrical">Electrical</option>
                          <option value="Plumbing">Plumbing</option>
                          <option value="Paint">Paint</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-bold mb-2">Count In Stock</label>
                        <input type="number" className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#f5a623]" value={countInStock} onChange={(e) => setCountInStock(Number(e.target.value))} required />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-bold mb-2">Image</label>
                        <div className="flex items-center space-x-4">
                          <input type="text" className="flex-grow p-2 border border-gray-300 rounded-md bg-gray-50" value={image} onChange={(e) => setImage(e.target.value)} placeholder="Enter image URL or upload" />
                          <input type="file" className="text-sm" onChange={uploadFileHandler} />
                        </div>
                        {uploading && <p className="text-xs text-blue-600 mt-1">Uploading image...</p>}
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-bold mb-2">Description</label>
                        <textarea className="w-full p-2 border border-gray-300 rounded-md h-32 focus:outline-none focus:border-[#f5a623]" value={description} onChange={(e) => setDescription(e.target.value)} required></textarea>
                      </div>
                      <div className="md:col-span-2">
                        <button type="submit" className="w-full bg-[#f5a623] text-black font-bold py-3 rounded-lg hover:bg-[#e79d1f] shadow-sm transition-colors">Create Product</button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="bg-white shadow-sm rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-600 font-bold text-sm uppercase tracking-wider">
                      <tr><th className="p-4">Product</th><th className="p-4">Price</th><th className="p-4">Category</th><th className="p-4">Stock</th><th className="p-4">Actions</th></tr>
                    </thead>
                    <tbody className="divide-y">
                      {sellerProducts.map((product) => (
                        <tr key={product._id} className="hover:bg-gray-50">
                          <td className="p-4 flex items-center">
                            <img src={product.image?.startsWith('http') ? product.image : `http://localhost:5000${product.image}`} alt={product.name} className="h-10 w-10 object-contain mr-3" />
                            <span className="font-medium truncate max-w-xs">{product.name}</span>
                          </td>
                          <td className="p-4 font-bold text-red-700">₹{product.price.toLocaleString('en-IN')}</td>
                          <td className="p-4">{product.category}</td>
                          <td className="p-4">{product.countInStock}</td>
                          <td className="p-4 flex space-x-2">
                            <button className="text-blue-600 hover:text-blue-800 p-1"><Edit className="h-5 w-5" /></button>
                            <button onClick={() => deleteHandler(product._id)} className="text-red-600 hover:text-red-800 p-1"><Trash2 className="h-5 w-5" /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ===== ORDERS TAB ===== */}
            {activeTab === 'orders' && (
              <div>
                <h1 className="text-3xl font-bold mb-8 text-gray-800">All Orders</h1>
                <div className="bg-white shadow-sm rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-600 font-bold text-sm uppercase tracking-wider">
                      <tr><th className="p-4">Order ID</th><th className="p-4">Type</th><th className="p-4">Date</th><th className="p-4">Total</th><th className="p-4">Paid</th><th className="p-4">Delivered</th><th className="p-4">Actions</th></tr>
                    </thead>
                    <tbody className="divide-y">
                      {allOrders.map((order) => (
                        <tr key={order._id} className="hover:bg-gray-50">
                          <td className="p-4 text-xs font-mono">{order._id.substring(0, 12)}...</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${order.orderType === 'enquiry' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                              {order.orderType === 'enquiry' ? 'Enquiry' : 'Standard'}
                            </span>
                          </td>
                          <td className="p-4 text-sm">{new Date(order.createdAt).toLocaleDateString()}</td>
                          <td className="p-4 font-bold text-red-700">₹{order.totalPrice.toLocaleString('en-IN')}</td>
                          <td className="p-4"><span className={`font-bold ${order.isPaid ? 'text-green-600' : 'text-red-600'}`}>{order.isPaid ? 'YES' : 'NO'}</span></td>
                          <td className="p-4"><span className={`font-bold ${order.isDelivered ? 'text-green-600' : 'text-red-600'}`}>{order.isDelivered ? 'YES' : 'NO'}</span></td>
                          <td className="p-4">
                            {!order.isDelivered && order.orderType !== 'enquiry' && (
                              <button onClick={() => deliverHandler(order._id)} className="bg-[#f5a623] text-black text-xs font-bold py-1 px-3 rounded hover:bg-[#e79d1f] transition-colors">Mark Delivered</button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ===== USERS & ROLES TAB ===== */}
            {activeTab === 'users' && (
              <div>
                <div className="flex justify-between items-center mb-8">
                  <h1 className="text-3xl font-bold text-gray-800">Users & Role Management</h1>
                  <button
                    onClick={() => setShowAddUserForm(!showAddUserForm)}
                    className="bg-[#f5a623] text-black font-bold py-2 px-4 rounded-lg flex items-center hover:bg-[#e79d1f] shadow-sm transition-colors"
                  >
                    {showAddUserForm ? <X className="h-5 w-5 mr-2" /> : <Plus className="h-5 w-5 mr-2" />}
                    {showAddUserForm ? 'Cancel' : 'Add User'}
                  </button>
                </div>

                {showAddUserForm && (
                  <div className="bg-white p-8 rounded-xl shadow-sm mb-8 border border-[#f5a623]/20">
                    <h2 className="text-xl font-bold mb-6">Create New User / Staff</h2>
                    <form onSubmit={createUserHandler} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-bold mb-2">Full Name</label>
                        <input type="text" className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#f5a623]" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} required />
                      </div>
                      <div>
                        <label className="block text-sm font-bold mb-2">Email Address</label>
                        <input type="email" className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#f5a623]" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} required />
                      </div>
                      <div>
                        <label className="block text-sm font-bold mb-2">Password</label>
                        <input type="password" className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#f5a623]" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} required minLength="6" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold mb-2">Role</label>
                        <select className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#f5a623]" value={newUserRole} onChange={(e) => setNewUserRole(e.target.value)} required>
                          <option value="customer">Customer</option>
                          <option value="seller">Seller</option>
                          <option value="sales">Sales</option>
                          <option value="support">Support</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <button type="submit" className="w-full bg-[#f5a623] text-black font-bold py-3 rounded-lg hover:bg-[#e79d1f] shadow-sm transition-colors">Create User</button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="bg-white shadow-sm rounded-xl overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-600 font-bold text-sm uppercase tracking-wider">
                      <tr><th className="p-4">Name</th><th className="p-4">Email</th><th className="p-4">Role</th><th className="p-4">Joined</th><th className="p-4">Actions</th></tr>
                    </thead>
                    <tbody className="divide-y">
                      {allUsers.map((user) => (
                        <tr key={user._id} className="hover:bg-gray-50">
                          <td className="p-4 font-medium">{user.name}</td>
                          <td className="p-4 text-sm">{user.email}</td>
                          <td className="p-4">
                            <select value={user.role} onChange={(e) => updateRoleHandler(user._id, e.target.value)} className="border border-gray-300 rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider focus:outline-none focus:border-[#f5a623] bg-white">
                              <option value="customer">Customer</option>
                              <option value="seller">Seller</option>
                              <option value="sales">Sales</option>
                              <option value="support">Support</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td className="p-4 text-sm">{new Date(user.createdAt).toLocaleDateString()}</td>
                          <td className="p-4">
                            <button onClick={() => deleteUserHandler(user._id)} className="text-red-600 hover:text-red-800 p-1" disabled={user._id === userInfo._id}>
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ===== TEAM MONITOR TAB ===== */}
            {activeTab === 'teams' && (
              <div>
                <h1 className="text-3xl font-bold mb-8 text-gray-800">Team Monitor</h1>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Sales Team */}
                  <div className="bg-white rounded-xl shadow-sm border border-amber-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-5 border-b border-amber-200 flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-bold text-gray-800">Sales Team</h2>
                        <p className="text-sm text-gray-500">{salesTeam.length} members · {enquiries.length} enquiries</p>
                      </div>
                      <Link to="/sales/dashboard" className="text-sm font-bold text-[#f5a623] hover:underline flex items-center">Open Dashboard <ChevronRight className="h-4 w-4 ml-1" /></Link>
                    </div>
                    <div className="p-5">
                      {salesTeam.length === 0 ? <p className="text-gray-400 text-sm">No sales staff assigned yet. Go to Users & Roles to assign.</p> : (
                        <div className="space-y-3">
                          {salesTeam.map(u => (
                            <div key={u._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <p className="font-bold text-sm text-gray-800">{u.name}</p>
                                <p className="text-xs text-gray-500">{u.email}</p>
                              </div>
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-bold uppercase">Sales</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="mt-5 pt-4 border-t">
                        <h3 className="text-sm font-bold text-gray-700 mb-3">Enquiry Summary</h3>
                        <div className="grid grid-cols-2 gap-3 text-center">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xl font-black text-gray-800">{enquiries.filter(e => e.enquiryStatus === 'pending').length}</p>
                            <p className="text-xs text-gray-500 font-bold">Pending</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xl font-black text-emerald-600">{enquiries.filter(e => e.enquiryStatus === 'accepted').length}</p>
                            <p className="text-xs text-gray-500 font-bold">Accepted</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Support Team */}
                  <div className="bg-white rounded-xl shadow-sm border border-blue-200 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 border-b border-blue-200 flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-bold text-gray-800">Support Team</h2>
                        <p className="text-sm text-gray-500">{supportTeam.length} members · {pendingOrders} pending deliveries</p>
                      </div>
                      <Link to="/support/dashboard" className="text-sm font-bold text-blue-500 hover:underline flex items-center">Open Dashboard <ChevronRight className="h-4 w-4 ml-1" /></Link>
                    </div>
                    <div className="p-5">
                      {supportTeam.length === 0 ? <p className="text-gray-400 text-sm">No support staff assigned yet. Go to Users & Roles to assign.</p> : (
                        <div className="space-y-3">
                          {supportTeam.map(u => (
                            <div key={u._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <p className="font-bold text-sm text-gray-800">{u.name}</p>
                                <p className="text-xs text-gray-500">{u.email}</p>
                              </div>
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase">Support</span>
                            </div>
                          ))}
                        </div>
                      )}
                      <div className="mt-5 pt-4 border-t">
                        <h3 className="text-sm font-bold text-gray-700 mb-3">Order Fulfillment</h3>
                        <div className="grid grid-cols-2 gap-3 text-center">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xl font-black text-orange-500">{pendingOrders}</p>
                            <p className="text-xs text-gray-500 font-bold">Pending</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-xl font-black text-emerald-600">{allOrders.filter(o => o.isDelivered).length}</p>
                            <p className="text-xs text-gray-500 font-bold">Delivered</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
