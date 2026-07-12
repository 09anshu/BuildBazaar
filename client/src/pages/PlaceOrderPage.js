import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { createOrder, resetOrder } from '../store/slices/orderSlice';
import { clearCart } from '../store/slices/cartSlice';
import { toast } from 'react-toastify';
import getImageUrl from '../utils/getImageUrl';

const PlaceOrderPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cart = useSelector((state) => state.cart);
  const { order, success, error } = useSelector((state) => state.orders);

  // Calculate prices
  const addDecimals = (num) => {
    return (Math.round(num * 100) / 100).toFixed(2);
  };

  const itemsPrice = addDecimals(
    cart.cartItems.reduce((acc, item) => acc + item.price * item.qty, 0)
  );

  let discountAmount = 0;
  if (cart.appliedCoupon) {
    const applicableCartTotal = cart.cartItems.reduce((acc, item) => {
      if (cart.appliedCoupon.applicableProducts.length === 0 || cart.appliedCoupon.applicableProducts.includes(item.product)) {
        return acc + item.price * item.qty;
      }
      return acc;
    }, 0);
    discountAmount = (applicableCartTotal * cart.appliedCoupon.discountPercent) / 100;
  }
  const discountPrice = addDecimals(discountAmount);

  const shippingPrice = addDecimals(itemsPrice - discountPrice > 5000 ? 0 : 500);
  const taxPrice = addDecimals(Number((0.18 * (itemsPrice - discountPrice)).toFixed(2)));
  const totalPrice = (
    Number(itemsPrice) -
    Number(discountPrice) +
    Number(shippingPrice) +
    Number(taxPrice)
  ).toFixed(2);

  useEffect(() => {
    if (success) {
      navigate(`/order/${order._id}`);
      dispatch(resetOrder());
      dispatch(clearCart());
    }
    if (error) {
      toast.error(error);
    }
  }, [navigate, success, order, error, dispatch]);

  const placeOrderHandler = () => {
    dispatch(
      createOrder({
        orderItems: cart.cartItems,
        shippingAddress: cart.shippingAddress,
        paymentMethod: cart.paymentMethod,
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
        discountCode: cart.appliedCoupon ? cart.appliedCoupon.discountCode : undefined,
      })
    );
  };

  return (
    <div className="bg-gray-100 min-h-screen pt-10 px-4">
      <div className="max-w-screen-2xl mx-auto">
        {/* Checkout Steps Placeholder */}
        <div className="flex items-center justify-between mb-10 text-xs font-bold text-gray-500 uppercase tracking-wider max-w-xl mx-auto">
          <div className="text-gray-400">1. Shipping</div>
          <div className="text-gray-400">2. Payment</div>
          <div className="text-orange-600">3. Place Order</div>
        </div>

        <h1 className="text-3xl font-medium mb-8 text-center md:text-left">Review your order</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 shadow-sm rounded-md border border-gray-300">
              <h2 className="text-xl font-bold mb-4">Shipping Address</h2>
              <p className="text-sm text-gray-700">
                {cart.shippingAddress.address}, {cart.shippingAddress.city},{' '}
                {cart.shippingAddress.postalCode}, {cart.shippingAddress.country}
              </p>
              <Link to="/shipping" className="text-xs text-blue-600 hover:underline mt-2 inline-block">Edit</Link>
            </div>

            <div className="bg-white p-6 shadow-sm rounded-md border border-gray-300">
              <h2 className="text-xl font-bold mb-4">Payment Method</h2>
              <p className="text-sm text-gray-700">Method: {cart.paymentMethod}</p>
              <Link to="/payment" className="text-xs text-blue-600 hover:underline mt-2 inline-block">Edit</Link>
            </div>

            <div className="bg-white p-6 shadow-sm rounded-md border border-gray-300">
              <h2 className="text-xl font-bold mb-4">Order Items</h2>
              {cart.cartItems.length === 0 ? (
                <p>Your cart is empty</p>
              ) : (
                <div className="space-y-4">
                  {cart.cartItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex items-center space-x-4">
                        <img 
                          src={getImageUrl(item.image)} 
                          alt={item.name} 
                          className="h-12 w-12 object-contain"
                        />
                        <Link to={`/product/${item.product}`} className="text-sm hover:underline hover:text-blue-600 line-clamp-1 max-w-md">
                          {item.name}
                        </Link>
                      </div>
                      <div className="text-sm text-right">
                        {item.qty} x ₹{item.price.toLocaleString('en-IN')} = <span className="font-bold">₹{(item.qty * item.price).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white p-6 shadow-sm rounded-md border border-gray-300 sticky top-24">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span>Items</span>
                  <span>₹{itemsPrice}</span>
                </div>
                {Number(discountPrice) > 0 && (
                  <div className="flex justify-between text-sm text-emerald-600 font-bold">
                    <span>Discount ({cart.appliedCoupon?.discountCode})</span>
                    <span>-₹{discountPrice}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>₹{shippingPrice}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax (GST 18%)</span>
                  <span>₹{taxPrice}</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-xl font-bold text-red-700">
                  <span>Order Total:</span>
                  <span>₹{totalPrice}</span>
                </div>
              </div>

              <button
                onClick={placeOrderHandler}
                disabled={cart.cartItems.length === 0}
                className={`w-full bg-amazon_yellow text-black font-bold py-2 rounded-md transition-colors hover:bg-yellow-500 shadow-sm ${
                  cart.cartItems.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                Place your order
              </button>

              <div className="mt-4 text-xs text-gray-500 leading-relaxed">
                By placing your order, you agree to BuildBazaar's privacy notice and conditions of use.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrderPage;
