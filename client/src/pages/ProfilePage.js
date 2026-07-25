import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { User, Phone, MapPin, Mail, ShieldCheck } from 'lucide-react';

const ProfilePage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState({ street: '', city: '', state: '', zipCode: '', country: '' });
  const [loading, setLoading] = useState(false);

  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
    } else {
      const fetchProfile = async () => {
        setLoading(true);
        try {
          const config = {
            headers: {
              Authorization: `Bearer ${userInfo.token}`,
            },
          };
          const { data } = await axios.get('/api/users/profile', config);
          setName(data.name);
          setEmail(data.email);
          setPhone(data.phone || '');
          setAddress(data.address || { street: '', city: '', state: '', zipCode: '', country: '' });
        } catch (error) {
          toast.error(error.response?.data?.message || error.message);
        } finally {
          setLoading(false);
        }
      };
      fetchProfile();
    }
  }, [navigate, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      await axios.put('/api/users/profile', { name, email, phone, address }, config);
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen pt-10 px-4 pb-20">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Card */}
        <div className="md:col-span-1">
          <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200 flex flex-col items-center text-center">
            <div className="bg-gray-200 rounded-full h-24 w-24 flex items-center justify-center mb-4">
              <span className="text-3xl font-bold text-gray-500">{name.charAt(0)}</span>
            </div>
            <h2 className="text-xl font-bold mb-1">{name}</h2>
            <p className="text-sm text-gray-500 mb-4 capitalize">{userInfo?.role}</p>
            <div className="flex items-center text-xs text-green-700 font-bold bg-green-50 px-3 py-1 rounded-full mb-6">
              <ShieldCheck className="h-4 w-4 mr-1" />
              Verified Account
            </div>
            
            <div className="w-full space-y-3 text-left border-t pt-6">
              <div className="flex items-center text-sm text-gray-600">
                <Mail className="h-4 w-4 mr-3" />
                {email}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <Phone className="h-4 w-4 mr-3" />
                {phone || 'No phone number'}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-3" />
                {address.city ? `${address.city}, ${address.country}` : 'No address'}
              </div>
            </div>
          </div>
        </div>

        {/* Right Card - Form */}
        <div className="md:col-span-2">
          <div className="bg-white p-8 rounded-md shadow-sm border border-gray-200">
            <h1 className="text-2xl font-bold mb-8">Account Settings</h1>
            
            <form onSubmit={submitHandler} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold mb-2">Full Name</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-amazon_yellow"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Email Address</label>
                  <input
                    type="email"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-amazon_yellow"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Phone Number</label>
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-amazon_yellow"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-bold mb-4">Mailing Address</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-bold mb-2">Street</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-amazon_yellow"
                      value={address.street}
                      onChange={(e) => setAddress({...address, street: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">City</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-amazon_yellow"
                      value={address.city}
                      onChange={(e) => setAddress({...address, city: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">State</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-amazon_yellow"
                      value={address.state}
                      onChange={(e) => setAddress({...address, state: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">Zip Code</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-amazon_yellow"
                      value={address.zipCode}
                      onChange={(e) => setAddress({...address, zipCode: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">Country</label>
                    <input
                      type="text"
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-amazon_yellow"
                      value={address.country}
                      onChange={(e) => setAddress({...address, country: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-amazon_yellow text-black font-bold py-2 px-8 rounded-md hover:bg-yellow-500 shadow-sm transition-colors"
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
