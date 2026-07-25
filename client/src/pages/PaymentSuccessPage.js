import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckCircle, ShoppingBag, ArrowRight } from 'lucide-react';

const PaymentSuccessPage = () => {
  const [countdown, setCountdown] = useState(4);
  const navigate = useNavigate();

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      // Replace the current entry (Success page) with Home
      navigate('/', { replace: true });
      // Then push My Orders on top, so Back goes to Home
      setTimeout(() => navigate('/myorders'), 10);
    }
  }, [countdown, navigate]);

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
      <div className="bg-white p-10 rounded-2xl shadow-xl max-w-lg w-full text-center border border-gray-100">
        <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-emerald-100 mb-6 relative">
          <CheckCircle className="h-12 w-12 text-emerald-500 relative z-10" />
          <div className="absolute inset-0 rounded-full border-4 border-emerald-500 animate-ping opacity-20"></div>
        </div>
        
        <h1 className="text-3xl font-black text-gray-900 mb-2">Payment Successful!</h1>
        <p className="text-gray-500 mb-8 text-lg">Your order has been placed securely.</p>
        
        <div className="bg-gray-50 rounded-xl p-6 mb-6 border border-gray-100">
          <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Order Tracking ID</p>
          <p className="text-xl font-mono text-gray-800 font-bold tracking-widest">
            BB-{Math.floor(100000 + Math.random() * 900000)}-DEMO
          </p>
        </div>

        <p className="text-blue-600 font-medium mb-6 animate-pulse">
          Redirecting to your orders in {countdown} seconds...
        </p>

        <div className="space-y-4">
          <Link 
            to="/" 
            className="flex items-center justify-center w-full py-4 bg-gray-900 text-white rounded-xl font-bold text-lg hover:bg-gray-800 transition-colors shadow-lg hover:shadow-gray-900/20"
          >
            <ShoppingBag className="mr-2 h-5 w-5" />
            Continue Shopping
          </Link>
          <Link 
            to="/myorders" 
            className="flex items-center justify-center w-full py-4 bg-white text-gray-700 border-2 border-gray-200 rounded-xl font-bold text-lg hover:bg-gray-50 hover:border-gray-300 transition-colors"
          >
            View My Orders
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
