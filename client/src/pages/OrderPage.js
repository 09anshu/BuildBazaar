import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getOrderDetails, payOrder } from '../store/slices/orderSlice';
import { ShieldCheck, Truck, CreditCard, ChevronLeft, XCircle, Clock, CheckCircle2, AlertTriangle, MessageSquare } from 'lucide-react';
import { toast } from 'react-toastify';

const OrderPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();

  const { order, loading, error, success: successPay } = useSelector((state) => state.orders);
  const { userInfo } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getOrderDetails(id));
  }, [dispatch, id, successPay]);

  const payHandler = () => {
    // Mock payment result
    const paymentResult = {
      id: `PAY-${Date.now()}`,
      status: 'COMPLETED',
      update_time: new Date().toISOString(),
      email_address: userInfo.email,
    };
    dispatch(payOrder({ orderId: id, paymentResult }));
    toast.success('Payment Successful!');
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amazon_blue"></div></div>;
  if (error) return <div className="bg-red-100 text-red-700 p-4 m-10 rounded-md">{error}</div>;
  if (!order) return null;

  const isEnquiry = order.orderType === 'enquiry';
  const isRejected = isEnquiry && order.enquiryStatus === 'rejected';
  const isAccepted = order.enquiryStatus === 'accepted';

  // Determine the enquiry status display
  const getEnquiryStatusDisplay = () => {
    switch (order.enquiryStatus) {
      case 'pending':
        return { label: 'Pending Review', color: 'bg-gray-100 text-gray-700', icon: Clock };
      case 'quoted':
        return { label: 'Quote Sent — Awaiting Response', color: 'bg-amber-100 text-amber-800', icon: AlertTriangle };
      case 'countered':
        return { label: 'Counter Offer Under Review', color: 'bg-blue-100 text-blue-800', icon: MessageSquare };
      case 'accepted':
        return { label: 'Accepted — Converted to Order', color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle2 };
      case 'rejected':
        return { label: 'Rejected / Cancelled', color: 'bg-red-100 text-red-800', icon: XCircle };
      default:
        return { label: order.enquiryStatus, color: 'bg-gray-100 text-gray-700', icon: Clock };
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen pt-10 px-4">
      <div className="max-w-screen-2xl mx-auto">
        <Link to="/myorders" className="flex items-center text-sm text-gray-500 hover:text-amazon_yellow mb-4">
          <ChevronLeft className="h-4 w-4" />
          Back to my orders
        </Link>

        <h1 className="text-3xl font-medium mb-8">
          {isEnquiry ? 'Enquiry Details' : 'Order Summary'}: <span className="text-sm font-normal text-gray-500">{order._id}</span>
        </h1>

        {/* Rejected Banner — prominent, full-width */}
        {isRejected && (
          <div className="mb-8 p-5 bg-red-50 rounded-xl border border-red-200 flex items-start gap-4">
            <XCircle className="h-6 w-6 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-red-800 text-lg">This enquiry has been rejected</h3>
              <p className="text-sm text-red-600 mt-1">
                The sales team was unable to proceed with this enquiry.
                {order.negotiationNotes && (
                  <span className="block mt-1"><strong>Notes from Sales:</strong> "{order.negotiationNotes}"</span>
                )}
              </p>
              <p className="text-xs text-red-500 mt-3">You can submit a new enquiry from the product page if you'd like to try again.</p>
            </div>
          </div>
        )}

        {/* Enquiry Status Card — shown for all enquiry-type orders */}
        {(isEnquiry || isAccepted) && (
          <div className="mb-8">
            <div className="bg-white p-6 shadow-sm rounded-md border border-gray-300">
              <div className="flex items-center mb-4">
                <MessageSquare className="h-6 w-6 mr-3 text-blue-600" />
                <h2 className="text-xl font-bold">Enquiry Status</h2>
              </div>
              {(() => {
                const status = getEnquiryStatusDisplay();
                const StatusIcon = status.icon;
                return (
                  <div className={`p-3 rounded-md text-sm font-bold flex items-center gap-2 ${status.color}`}>
                    <StatusIcon className="h-4 w-4" />
                    {status.label}
                  </div>
                );
              })()}

              {/* Negotiation details */}
              <div className="mt-4 space-y-2">
                {order.totalPrice > 0 && (
                  <p className="text-sm text-gray-700">
                    <strong>Quoted Price:</strong> <span className="font-bold text-emerald-700">₹{order.totalPrice.toLocaleString('en-IN')}</span>
                  </p>
                )}
                {order.counterPrice > 0 && (
                  <p className="text-sm text-gray-700">
                    <strong>Counter Price:</strong> <span className="font-bold text-blue-700">₹{order.counterPrice.toLocaleString('en-IN')}</span>
                  </p>
                )}
                {order.negotiationNotes && (
                  <p className="text-sm text-gray-600 italic">
                    <strong>Notes:</strong> "{order.negotiationNotes}"
                  </p>
                )}
                {order.customNotes && (
                  <p className="text-sm text-gray-600 italic">
                    <strong>Customer Notes:</strong> "{order.customNotes}"
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 shadow-sm rounded-md border border-gray-300">
              <div className="flex items-center mb-4">
                <Truck className="h-6 w-6 mr-3 text-blue-600" />
                <h2 className="text-xl font-bold">Shipping</h2>
              </div>
              <p className="text-sm text-gray-700 mb-2">
                <strong>Name:</strong> {order.user.name}
              </p>
              <p className="text-sm text-gray-700 mb-2">
                <strong>Email:</strong> {order.user.email}
              </p>
              <p className="text-sm text-gray-700 mb-4">
                <strong>Address:</strong> {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.postalCode}, {order.shippingAddress.country}
              </p>
              <div className={`p-2 rounded-md text-sm ${
                isRejected
                  ? 'bg-red-100 text-red-700'
                  : order.isDelivered
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
              }`}>
                {isRejected
                  ? 'Enquiry Rejected — No delivery'
                  : order.isDelivered
                    ? `Delivered on ${new Date(order.deliveredAt).toLocaleString()}`
                    : 'Not Delivered'}
              </div>
            </div>

            <div className="bg-white p-6 shadow-sm rounded-md border border-gray-300">
              <div className="flex items-center mb-4">
                <CreditCard className="h-6 w-6 mr-3 text-blue-600" />
                <h2 className="text-xl font-bold">Payment Method</h2>
              </div>
              <p className="text-sm text-gray-700 mb-4">
                <strong>Method:</strong> {order.paymentMethod}
              </p>
              <div className={`p-2 rounded-md text-sm ${
                isRejected
                  ? 'bg-red-100 text-red-700'
                  : order.isPaid
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
              }`}>
                {isRejected
                  ? 'Enquiry Rejected — No payment required'
                  : order.isPaid
                    ? `Paid on ${new Date(order.paidAt).toLocaleString()}`
                    : 'Not Paid'}
              </div>
            </div>

            <div className="bg-white p-6 shadow-sm rounded-md border border-gray-300">
              <div className="flex items-center mb-4">
                <ShieldCheck className="h-6 w-6 mr-3 text-blue-600" />
                <h2 className="text-xl font-bold">{isEnquiry ? 'Enquiry Items' : 'Order Items'}</h2>
              </div>
              <div className="space-y-4">
                {order.orderItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-2 border-b last:border-0">
                    <div className="flex items-center space-x-4">
                      <img 
                        src={item.image?.startsWith('http') ? item.image : `http://localhost:5000${item.image}`} 
                        alt={item.name} 
                        className={`h-12 w-12 object-contain ${isRejected ? 'opacity-50' : ''}`}
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
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white p-6 shadow-sm rounded-md border border-gray-300 sticky top-24">
              <h2 className="text-xl font-bold mb-6">
                {isRejected ? 'Enquiry Summary' : isEnquiry ? 'Quote Summary' : 'Order Total'}
              </h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span>Items</span>
                  <span>₹{order.itemsPrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>₹{order.shippingPrice.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>₹{order.taxPrice.toLocaleString('en-IN')}</span>
                </div>
                <div className={`border-t pt-3 flex justify-between text-xl font-bold ${isRejected ? 'text-red-500 line-through' : 'text-red-700'}`}>
                  <span>Total:</span>
                  <span>₹{order.totalPrice.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Show pay button only for non-rejected, non-enquiry, unpaid orders */}
              {!order.isPaid && !isRejected && !isEnquiry && (
                <button
                  onClick={payHandler}
                  className="w-full bg-amazon_yellow text-black font-bold py-2 rounded-md transition-colors hover:bg-yellow-500 shadow-sm"
                >
                  Pay Now (Mock Payment)
                </button>
              )}

              {/* Rejected state in sidebar */}
              {isRejected && (
                <div className="text-center">
                  <p className="text-sm text-red-600 font-bold mb-3">This enquiry was rejected</p>
                  <Link
                    to="/"
                    className="inline-block w-full bg-amazon_yellow text-black font-bold py-2 rounded-md transition-colors hover:bg-yellow-500 shadow-sm text-center"
                  >
                    Browse Products
                  </Link>
                </div>
              )}

              {/* Pending enquiry — no pay button */}
              {isEnquiry && !isRejected && (
                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    {order.enquiryStatus === 'pending'
                      ? 'Waiting for sales team to provide a quote.'
                      : order.enquiryStatus === 'quoted'
                        ? 'Review the quote and accept or propose a counter from My Orders.'
                        : order.enquiryStatus === 'countered'
                          ? 'Your counter offer is under review by the sales team.'
                          : ''}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderPage;
