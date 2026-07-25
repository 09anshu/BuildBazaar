import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { clearCart } from '../store/slices/cartSlice';
import { ShieldCheck, CreditCard } from 'lucide-react';

const DemoPaymentPage = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { cartItems, paymentMethod } = useSelector((state) => state.cart);
  const totalAmount = cartItems.reduce((acc, item) => acc + item.qty * item.price, 0);

  const handlePayment = (e) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate payment processing delay
    setTimeout(() => {
      // Clear cart
      dispatch(clearCart());
      setIsProcessing(false);
      
      // Navigate to success page
      navigate('/payment-success');
    }, 2000);
  };

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full border border-gray-100">
        <div className="text-center mb-8">
          <div className="bg-blue-100 p-3 rounded-full inline-block mb-3">
            <CreditCard className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-black text-gray-800">Secure Payment</h2>
          <p className="text-gray-500 text-sm mt-1 flex items-center justify-center">
            <ShieldCheck className="h-4 w-4 mr-1 text-emerald-500" /> 
            Demo Gateway — No actual charge
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
          <p className="text-sm text-gray-500 font-bold uppercase tracking-wider mb-1">Total to Pay</p>
          <p className="text-3xl font-black text-gray-800">₹{totalAmount.toLocaleString('en-IN')}</p>
        </div>

        <form onSubmit={handlePayment}>
          {paymentMethod === 'UPI' && (
            <div className="space-y-4 mb-8 text-center">
              <div className="bg-gray-100 p-8 rounded-xl inline-block mb-4 border-2 border-dashed border-gray-300">
                <p className="text-gray-400 font-medium">[ QR Code Placeholder ]</p>
                <p className="text-xs text-gray-400 mt-2">Scan with any UPI app</p>
              </div>
              <div className="flex items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">OR</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>
              <div className="text-left">
                <label className="block text-sm font-bold text-gray-700 mb-1">Enter UPI ID</label>
                <input 
                  type="text" 
                  placeholder="username@bank" 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
          )}

          {paymentMethod === 'Pay Later' && (
            <div className="space-y-4 mb-8 text-center">
              <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 mb-4">
                <p className="text-blue-800 font-bold mb-2">BuildBazaar Pay Later</p>
                <p className="text-sm text-blue-600">Available Limit: ₹50,000</p>
              </div>
              <div className="text-left">
                <label className="block text-sm font-bold text-gray-700 mb-1">Enter OTP sent to registered mobile</label>
                <input 
                  type="text" 
                  placeholder="• • • • • •" 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono tracking-[0.5em] text-center"
                  maxLength="6"
                  required
                />
              </div>
            </div>
          )}

          {(paymentMethod === 'Credit/Debit Card' || paymentMethod === 'EMI') && (
            <div className="space-y-4 mb-8">
              {paymentMethod === 'EMI' && (
                <div className="bg-orange-50 text-orange-700 p-3 rounded-lg text-sm mb-4 border border-orange-100 font-medium">
                  EMI selected: ₹{(totalAmount / 6).toFixed(2)}/mo for 6 months
                </div>
              )}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Card Number</label>
                <input 
                  type="text" 
                  placeholder="0000 0000 0000 0000" 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono tracking-widest"
                  required
                />
              </div>
              
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Expiry</label>
                  <input 
                    type="text" 
                    placeholder="MM/YY" 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-700 mb-1">CVV</label>
                  <input 
                    type="password" 
                    placeholder="•••" 
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    required
                    maxLength="4"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Name on Card</label>
                <input 
                  type="text" 
                  placeholder="John Doe" 
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 uppercase"
                  required
                />
              </div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={isProcessing}
            className={`w-full py-4 rounded-xl font-bold text-lg text-white transition-all shadow-lg flex items-center justify-center ${
              isProcessing 
                ? 'bg-blue-400 cursor-wait' 
                : 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-600/30'
            }`}
          >
            {isProcessing ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : `Pay ${paymentMethod === 'UPI' ? 'via UPI' : 'Now'}`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DemoPaymentPage;
