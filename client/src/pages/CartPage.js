import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, removeFromCart, applyCoupon, removeCoupon } from '../store/slices/cartSlice';
import { validateCoupon } from '../store/slices/offerSlice';
import { Trash2, ChevronLeft, ShieldCheck, Tag } from 'lucide-react';
import { toast } from 'react-toastify';
import getImageUrl from '../utils/getImageUrl';

const CartPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { cartItems, appliedCoupon } = useSelector((state) => state.cart);
  const { validatingCoupon } = useSelector((state) => state.offers);
  const [couponCode, setCouponCode] = useState('');

  const removeFromCartHandler = (id) => {
    dispatch(removeFromCart(id));
  };

  const checkoutHandler = () => {
    navigate('/login?redirect=shipping');
  };

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode) return;

    const productIds = cartItems.map(item => item.product);
    try {
      const resultAction = await dispatch(validateCoupon({ code: couponCode, productIds }));
      if (validateCoupon.fulfilled.match(resultAction)) {
        dispatch(applyCoupon(resultAction.payload));
        setCouponCode('');
        toast.success('Coupon applied successfully!');
      } else {
        toast.error(resultAction.payload || 'Invalid coupon code');
      }
    } catch (err) {
      toast.error('Failed to validate coupon');
    }
  };

  const handleRemoveCoupon = () => {
    dispatch(removeCoupon());
    toast.info('Coupon removed');
  };

  const itemsPrice = cartItems.reduce((acc, item) => acc + item.qty * item.price, 0);

  // Calculate discount based on applicable products
  let discountAmount = 0;
  if (appliedCoupon) {
    const applicableCartTotal = cartItems.reduce((acc, item) => {
      // If no applicable products specified, it's site-wide
      if (appliedCoupon.applicableProducts.length === 0 || appliedCoupon.applicableProducts.includes(item.product)) {
        return acc + item.qty * item.price;
      }
      return acc;
    }, 0);
    
    discountAmount = (applicableCartTotal * appliedCoupon.discountPercent) / 100;
  }

  const finalPrice = itemsPrice - discountAmount;

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-screen-2xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-medium mb-6">Shopping Cart</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-3 bg-white p-6 shadow-sm rounded-md">
            {cartItems.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl mb-4">Your Shopping Cart is empty.</p>
                <Link to="/" className="text-blue-600 hover:underline flex items-center justify-center">
                  <ChevronLeft className="h-4 w-4" />
                  Continue Shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {cartItems.map((item) => (
                  <div key={item.product} className="flex flex-col sm:flex-row items-center justify-between border-b pb-6 last:border-0">
                    <div className="flex items-center space-x-6 w-full sm:w-auto mb-4 sm:mb-0">
                      <Link to={`/product/${item.product}`}>
                        <img 
                          src={getImageUrl(item.image)} 
                          alt={item.name} 
                          className="h-24 w-24 object-contain"
                        />
                      </Link>
                      <div>
                        <Link to={`/product/${item.product}`} className="text-lg font-medium hover:text-blue-600 line-clamp-2">
                          {item.name}
                        </Link>
                        <p className="text-xs text-green-700 font-bold mt-1">In Stock</p>
                        <p className="text-xs text-gray-500 mt-1">Eligible for FREE Shipping</p>
                        <div className="flex items-center mt-3 space-x-4">
                          <div className="flex items-center bg-gray-100 rounded-md border border-gray-300 overflow-hidden">
                            <span className="px-2 text-xs font-bold text-gray-600">Qty:</span>
                            <input 
                              type="number"
                              min="1"
                              max={item.countInStock}
                              value={item.qty} 
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                if (val > 0 && val <= item.countInStock) {
                                  dispatch(addToCart({ ...item, qty: val }));
                                }
                              }}
                              className="bg-transparent p-1.5 w-16 text-sm outline-none font-semibold text-center border-l border-gray-300"
                            />
                          </div>
                          <button 
                            onClick={() => removeFromCartHandler(item.product)}
                            className="text-xs text-blue-600 hover:underline flex items-center"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="text-right w-full sm:w-auto">
                      {item.basePrice && item.price < item.basePrice && (
                        <div className="flex flex-col items-end">
                          <p className="text-xs text-gray-400 line-through">₹{item.basePrice.toLocaleString('en-IN')}</p>
                          <p className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded mb-1 border border-emerald-100">
                            Bulk Discount Applied!
                          </p>
                        </div>
                      )}
                      <p className="text-xl font-bold">₹{item.price.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Subtotal */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 shadow-sm rounded-md sticky top-24">
              <div className="flex items-center text-green-700 mb-4">
                <ShieldCheck className="h-6 w-6 mr-2" />
                <p className="text-xs">Your order qualifies for FREE Shipping. Choose this option at checkout.</p>
              </div>
              
              <div className="mb-6 pb-6 border-b border-gray-200">
                <p className="text-lg mb-2">
                  Subtotal ({cartItems.reduce((acc, item) => acc + item.qty, 0)} items): 
                  <span className="font-bold text-xl ml-2">₹{itemsPrice.toLocaleString('en-IN')}</span>
                </p>

                {appliedCoupon && (
                  <div className="flex justify-between items-center text-sm mb-2 text-emerald-600 font-bold bg-emerald-50 p-2 rounded border border-emerald-100">
                    <div className="flex items-center">
                      <Tag className="w-4 h-4 mr-1" />
                      {appliedCoupon.discountCode} ({appliedCoupon.discountPercent}%)
                    </div>
                    <div className="flex items-center">
                      -₹{discountAmount.toLocaleString('en-IN')}
                      <button onClick={handleRemoveCoupon} className="ml-3 text-gray-400 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {appliedCoupon && (
                  <p className="text-lg font-bold flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                    Total: <span className="text-2xl text-red-700">₹{finalPrice.toLocaleString('en-IN')}</span>
                  </p>
                )}
              </div>

              {!appliedCoupon && (
                <form onSubmit={handleApplyCoupon} className="mb-6">
                  <p className="text-sm font-bold text-gray-700 mb-2">Have a coupon code?</p>
                  <div className="flex">
                    <input 
                      type="text" 
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Enter code" 
                      className="border border-gray-300 rounded-l-md p-2 w-full text-sm font-mono focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 uppercase"
                    />
                    <button 
                      type="submit" 
                      disabled={validatingCoupon || !couponCode}
                      className="bg-gray-800 text-white px-4 text-sm font-bold rounded-r-md hover:bg-gray-700 disabled:bg-gray-400"
                    >
                      {validatingCoupon ? '...' : 'Apply'}
                    </button>
                  </div>
                </form>
              )}

              <button 
                onClick={checkoutHandler}
                disabled={cartItems.length === 0}
                className={`w-full font-bold py-2 rounded-md transition-colors ${
                  cartItems.length === 0 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-amazon_yellow hover:bg-yellow-500 text-black'
                }`}
              >
                Proceed to Buy
              </button>

              <div className="mt-6 border-t pt-4">
                <p className="text-xs text-gray-500">
                  The price and availability of items at BuildBazaar are subject to change. 
                  The Cart is a temporary place to store a list of your items and reflects each item's most recent price.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
