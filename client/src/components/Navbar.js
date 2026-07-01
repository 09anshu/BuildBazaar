import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  LogOut,
  LayoutDashboard,
  ChevronDown,
  MapPin,
  Factory,
  Box,
  Wrench,
  Tractor,
  CalendarClock,
  ShieldCheck,
} from 'lucide-react';
import { logout } from '../store/slices/authSlice';
import { saveShippingAddress } from '../store/slices/cartSlice';
import NotificationDropdown from './NotificationDropdown';

const Navbar = () => {
  const [keyword, setKeyword] = useState('');
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [locationMode, setLocationMode] = useState('address');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('India');
  const [gpsInfo, setGpsInfo] = useState(null);
  const [locationStatus, setLocationStatus] = useState('');
  const locationPanelRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { userInfo } = useSelector((state) => state.auth);
  const { cartItems, shippingAddress } = useSelector((state) => state.cart);
  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);


  useEffect(() => {
    setAddress(shippingAddress?.address || '');
    setCity(shippingAddress?.city || '');
    setPostalCode(shippingAddress?.postalCode || '');
    setCountry(shippingAddress?.country || 'India');
    if (shippingAddress?.latitude && shippingAddress?.longitude) {
      setGpsInfo({ latitude: shippingAddress.latitude, longitude: shippingAddress.longitude });
      setLocationMode('gps');
    }
  }, [shippingAddress]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (locationPanelRef.current && !locationPanelRef.current.contains(event.target)) {
        setIsLocationOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const categoryTabs = [
    { label: 'Cement', to: '/category/Cement', icon: Factory },
    { label: 'Steel', to: '/category/Steel', icon: Box },
    { label: 'Tools', to: '/category/Tools', icon: Wrench },
    { label: 'Machinery', to: '/category/Machinery', icon: Tractor },
    { label: 'Rentals', to: '/category/Rentals', icon: CalendarClock, badge: 'NEW' },
    { label: 'Safety Equipment', to: '/category/Safety', icon: ShieldCheck },
  ];

  const submitHandler = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/search/${keyword}`);
    } else {
      navigate('/');
    }
  };

  const logoutHandler = () => {
    dispatch(logout());
    navigate('/login');
  };

  const openLocationPanel = () => {
    setIsLocationOpen((prev) => !prev);
    setLocationStatus('');
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('GPS location is not supported in this browser.');
      return;
    }

    setLocationStatus('Getting your current site location...');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = Number(position.coords.latitude.toFixed(5));
        const longitude = Number(position.coords.longitude.toFixed(5));

        setGpsInfo({ latitude, longitude });
        setLocationMode('gps');
        setAddress(`GPS site location (${latitude}, ${longitude})`);
        setCity('Current site');
        setPostalCode('');
        setCountry('GPS');
        setLocationStatus('GPS location captured. Review and save to use it at checkout.');
      },
      () => {
        setLocationStatus('Unable to access your GPS location. Please allow location access and try again.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const saveLocation = () => {
    const payload = {
      address: address.trim(),
      city: city.trim(),
      postalCode: postalCode.trim(),
      country: country.trim(),
      source: locationMode,
      ...(gpsInfo ? { latitude: gpsInfo.latitude, longitude: gpsInfo.longitude } : {}),
    };

    dispatch(saveShippingAddress(payload));
    setLocationStatus('Site location saved for checkout.');
    setIsLocationOpen(false);
  };

  const displayLocationLine = shippingAddress?.address || shippingAddress?.city || 'Site location';
  const locationDetailLine = shippingAddress?.latitude && shippingAddress?.longitude
    ? `GPS ${shippingAddress.latitude}, ${shippingAddress.longitude}`
    : shippingAddress?.city || shippingAddress?.country || 'Set address or use GPS';

  return (
    <header className="sticky top-0 z-50 text-white">
      {/* Top Nav */}
      <div className="flex items-center gap-3 bg-[#0f1117] px-4 py-3">
        <div className="flex flex-grow items-center gap-3 sm:flex-initial sm:gap-4">
          <Link to="/" className="text-2xl font-black tracking-wide text-[#f5a623]">
            Build<span className="text-white">Bazaar</span>
          </Link>

          <div className="relative hidden md:block" ref={locationPanelRef}>
            <button
              type="button"
              onClick={openLocationPanel}
              className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-left text-xs text-white/90 transition-colors hover:border-[#f5a623]/50 hover:bg-white/10"
            >
              <MapPin className="h-4 w-4 shrink-0 text-[#f5a623]" />
              <span className="leading-tight">
                <span className="block text-[11px] text-white/55">Deliver to</span>
                <span className="font-semibold text-white">{displayLocationLine}</span>
              </span>
              <ChevronDown className="h-4 w-4 text-white/65" />
            </button>

            {isLocationOpen ? (
              <div className="absolute left-0 top-full z-50 mt-3 w-[26rem] rounded-2xl border border-white/10 bg-[#11151d] p-4 shadow-2xl shadow-black/40">
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-white">Deliver to site location</p>
                    <p className="text-xs text-white/55">Save an address or capture the current GPS site location.</p>
                  </div>
                  <button type="button" onClick={() => setIsLocationOpen(false)} className="text-white/50 hover:text-white">
                    <ChevronDown className="h-5 w-5 rotate-180" />
                  </button>
                </div>

                <div className="mb-4 flex rounded-full bg-white/5 p-1 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setLocationMode('address')}
                    className={`flex-1 rounded-full px-3 py-2 transition-colors ${locationMode === 'address' ? 'bg-[#f5a623] text-slate-950' : 'text-white/75 hover:text-white'}`}
                  >
                    Address
                  </button>
                  <button
                    type="button"
                    onClick={() => setLocationMode('gps')}
                    className={`flex-1 rounded-full px-3 py-2 transition-colors ${locationMode === 'gps' ? 'bg-[#f5a623] text-slate-950' : 'text-white/75 hover:text-white'}`}
                  >
                    GPS
                  </button>
                </div>

                {locationMode === 'address' ? (
                  <div className="grid gap-3">
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Site address"
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/35 focus:border-[#f5a623]/60 focus:outline-none"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="City"
                        className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/35 focus:border-[#f5a623]/60 focus:outline-none"
                      />
                      <input
                        type="text"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder="Postal code"
                        className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/35 focus:border-[#f5a623]/60 focus:outline-none"
                      />
                    </div>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      placeholder="Country"
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/35 focus:border-[#f5a623]/60 focus:outline-none"
                    />
                  </div>
                ) : (
                  <div className="grid gap-3">
                    <button
                      type="button"
                      onClick={useCurrentLocation}
                      className="rounded-xl border border-[#f5a623]/40 bg-[#f5a623] px-4 py-3 text-sm font-bold text-slate-950 transition-colors hover:bg-[#e79d1f]"
                    >
                      Use my GPS location
                    </button>
                    <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white/70">
                      {gpsInfo ? (
                        <span>
                          Captured: {gpsInfo.latitude}, {gpsInfo.longitude}
                        </span>
                      ) : (
                        <span>We will use your device location to tag the site and improve delivery accuracy.</span>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-4 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/65">
                  {locationDetailLine}
                </div>

                {locationStatus ? (
                  <p className="mt-3 text-xs text-amber-300">{locationStatus}</p>
                ) : null}

                <div className="mt-4 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={saveLocation}
                    className="flex-1 rounded-full bg-[#f5a623] px-4 py-2 text-sm font-bold text-slate-950 transition-colors hover:bg-[#e79d1f]"
                  >
                    Save site location
                  </button>
                  <button
                    type="button"
                    onClick={useCurrentLocation}
                    className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-[#f5a623]/50 hover:bg-white/5"
                  >
                    GPS
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Search */}
        <form
          onSubmit={submitHandler}
          className="hidden h-11 flex-grow cursor-pointer items-stretch overflow-hidden rounded-full bg-white sm:flex"
        >
          <input
            type="text"
            className="h-full w-6 flex-grow flex-shrink bg-white px-4 text-sm text-slate-900 placeholder:text-slate-500 focus:outline-none"
            placeholder="Search for materials, machinery, tools..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <button type="submit" className="flex h-full items-center justify-center bg-[#f5a623] px-5 text-slate-950 transition-colors hover:bg-[#e79d1f]">
            <Search className="h-5 w-5" />
          </button>
        </form>

        {/* Right Nav */}
        <div className="mx-6 flex items-center whitespace-nowrap text-xs text-white space-x-4 md:space-x-6">
          {userInfo ? (
            <div className="relative group cursor-pointer link">
              <p className="font-extrabold md:text-sm flex items-center">
                Hello, {userInfo.name}
                <User className="h-4 w-4 ml-1" />
              </p>
              <div className="absolute top-full right-0 z-50 hidden w-48 rounded-md bg-white py-2 text-black shadow-lg group-hover:block">
                <Link to="/profile" className="block px-4 py-2 hover:bg-gray-100">My Profile</Link>
                <Link to="/myorders" className="block px-4 py-2 hover:bg-gray-100">My Orders</Link>
                {(userInfo.role === 'seller' || userInfo.role === 'admin') && (
                  <Link to="/dashboard" className="flex items-center px-4 py-2 hover:bg-gray-100">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </Link>
                )}
                <button
                  onClick={logoutHandler}
                  className="flex w-full items-center px-4 py-2 text-left text-red-600 hover:bg-gray-100"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <Link to="/login" className="link">
              <p>Hello, sign in</p>
              <p className="font-extrabold md:text-sm">Account & Lists</p>
            </Link>
          )}

          <NotificationDropdown />

          <Link
            to="/cart"
            className="relative inline-flex items-center gap-2 rounded-full border border-[#f5a623] bg-[#f5a623] px-4 py-2 font-bold text-slate-950 shadow-lg shadow-[#f5a623]/20 transition-colors hover:bg-[#e79d1f]"
          >
            <span className="relative inline-flex items-center justify-center">
              <ShoppingCart className="h-5 w-5" />
              <span className="absolute -right-2 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full border border-slate-950 bg-slate-950 px-1 text-[10px] font-black text-white">
                {cartCount}
              </span>
            </span>
            <span className="hidden md:inline">Cart</span>
          </Link>
        </div>
      </div>

      {/* Bottom Nav */}
      <div className="flex items-center gap-2 overflow-x-auto border-t border-white/5 bg-[#181b24] px-4 py-2 text-sm text-white">
        <Link to="/all-products" className="link flex items-center font-bold text-white/90">
          <Menu className="h-6 w-6 mr-1" />
          All
        </Link>
        {categoryTabs.map((category) => {
          const Icon = category.icon;
          const isActive = location.pathname === category.to;

          return (
            <Link
              key={category.label}
              to={category.to}
                            className={`relative inline-flex items-center gap-2 rounded-full px-3 py-2 font-semibold transition-colors text-white/80`}
            >
              <Icon className="h-4 w-4" />
              <span>{category.label}</span>
              {category.badge ? (
                <span className="rounded-full bg-[#f5a623] px-2 py-0.5 text-[10px] font-black text-slate-950">
                  {category.badge}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </header>
  );
};

export default Navbar;
