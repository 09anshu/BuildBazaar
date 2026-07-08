import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { listProductDetails } from '../store/slices/productSlice';
import { addToCart } from '../store/slices/cartSlice';
import { fetchProductOffers } from '../store/slices/offerSlice';
import { 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  Settings,
  Shield,
  Zap,
  Weight,
  Star
} from 'lucide-react';
import { toast } from 'react-toastify';

const ProductPage = () => {
  const [qty, setQty] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { product, loading, error } = useSelector((state) => state.products);
  const { userInfo } = useSelector((state) => state.auth);
  const { productOffers } = useSelector((state) => state.offers);

  // Enquiry Modal State
  const [showEnquiry, setShowEnquiry] = useState(false);
  const [enquiryQty, setEnquiryQty] = useState('');
  const [enquiryNotes, setEnquiryNotes] = useState('');
  const [enquiryLoading, setEnquiryLoading] = useState(false);

  useEffect(() => {
    dispatch(listProductDetails(id));
    dispatch(fetchProductOffers(id));
  }, [dispatch, id]);

  const addToCartHandler = () => {
    dispatch(addToCart({
      product: product._id,
      name: product.name,
      image: product.image,
      price: product.price,
      basePrice: product.price,
      wholesaleTiers: product.wholesaleTiers,
      countInStock: product.countInStock,
      qty,
    }));
    toast.success(`${product.name} added to cart!`);
    navigate('/cart');
  };

  const submitEnquiryHandler = async (e) => {
    e.preventDefault();
    if (!userInfo) {
      toast.error('Please login to request a quote');
      navigate('/login');
      return;
    }
    
    try {
      setEnquiryLoading(true);
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      const orderItems = [{
        name: product.name,
        qty: Number(enquiryQty),
        image: product.image,
        price: product.price,
        product: product._id
      }];
      
      await axios.post('/api/orders/enquiry', {
        orderItems,
        customNotes: enquiryNotes
      }, config);
      
      toast.success('Bulk enquiry submitted successfully! Check your dashboard.');
      setShowEnquiry(false);
      setEnquiryQty('');
      setEnquiryNotes('');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setEnquiryLoading(false);
    }
  };

  const handleQtyChange = (type) => {
    if (type === 'inc' && qty < product.countInStock) {
      setQty(qty + 1);
    } else if (type === 'dec' && qty > 1) {
      setQty(qty - 1);
    }
  };

  // Mocking multiple images for the carousel
  const images = product?.image ? [
    product.image.startsWith('http') ? product.image : `http://localhost:5000${product.image}`,
    product.image.startsWith('http') ? product.image : `http://localhost:5000${product.image}`, // Just duplicating for demo
    product.image.startsWith('http') ? product.image : `http://localhost:5000${product.image}`,
    product.image.startsWith('http') ? product.image : `http://localhost:5000${product.image}`,
  ] : [];

  const nextImage = () => setActiveImageIndex((prev) => (prev + 1) % images.length);
  const prevImage = () => setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));

  // Dummy highlights based on the design
  const highlights = [
    { icon: <Shield className="h-5 w-5 text-amber-600" />, text: "High Durability & Long Life" },
    { icon: <Zap className="h-5 w-5 text-amber-600" />, text: "Fuel Efficient Engine" },
    { icon: <Weight className="h-5 w-5 text-amber-600" />, text: "Operating Weight: 21,000 kg" },
    { icon: <Settings className="h-5 w-5 text-amber-600" />, text: "Smooth Hydraulic System" }
  ];

  // Dummy specifications
  const specs = [
    { label: "Engine Power", value: "160 HP" },
    { label: "Bucket Capacity", value: "1.2 m³" },
    { label: "Max Digging Depth", value: "6.5 m" },
    { label: "Warranty", value: "2 Years" },
  ];

  // Estimated Delivery date (e.g., 5 days from now)
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 5);
  const formattedDeliveryDate = deliveryDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-screen-xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amazon_blue"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-md">{error}</div>
        ) : !product ? null : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              
              {/* Left Column: Images */}
              <div className="flex flex-col">
                <div className="relative bg-[#f6f6f6] rounded-2xl flex items-center justify-center p-8 aspect-[4/3] mb-4">
                  <button onClick={prevImage} className="absolute left-4 bg-white rounded-full p-2 shadow-md hover:bg-gray-50 z-10">
                    <ChevronLeft className="h-6 w-6 text-gray-700" />
                  </button>
                  
                  <img 
                    src={images[activeImageIndex]} 
                    alt={product.name} 
                    className="w-full h-full object-contain mix-blend-multiply"
                  />
                  
                  <button onClick={nextImage} className="absolute right-4 bg-white rounded-full p-2 shadow-md hover:bg-gray-50 z-10">
                    <ChevronRight className="h-6 w-6 text-gray-700" />
                  </button>
                </div>
                
                {/* Thumbnails */}
                <div className="flex justify-center gap-4">
                  {images.map((img, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`w-20 h-20 rounded-xl border-2 flex items-center justify-center bg-white overflow-hidden p-2 transition-all ${activeImageIndex === idx ? 'border-amber-400 shadow-sm' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <img src={img} alt="" className="w-full h-full object-contain mix-blend-multiply" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Column: Details & Buy Box */}
              <div>
                <div className="bg-[#f8f9fa] rounded-3xl p-8 h-full flex flex-col">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                  
                  {/* Dynamic Active Price based on Qty */}
                  {(() => {
                    let activePrice = product.price;
                    if (product.wholesaleTiers && product.wholesaleTiers.length > 0) {
                      const sortedTiers = [...product.wholesaleTiers].sort((a, b) => b.minQuantity - a.minQuantity);
                      for (let tier of sortedTiers) {
                        if (qty >= tier.minQuantity) {
                          activePrice = tier.price;
                          break;
                        }
                      }
                    }
                    return (
                      <div className="mb-6">
                        <div className="flex items-end gap-3">
                          <p className="text-3xl font-black text-gray-900">₹ {activePrice?.toLocaleString('en-IN')}</p>
                          {activePrice < product.price && (
                            <span className="text-sm font-bold text-emerald-600 mb-1 bg-emerald-50 px-2 py-0.5 rounded">Bulk Discount Active!</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">Includes GST</p>
                      </div>
                    );
                  })()}

                  {/* Active Offers Banner */}
                  {productOffers && productOffers.length > 0 && (
                    <div className="mb-6 space-y-2">
                      {productOffers.map(offer => (
                        <div key={offer._id} className="bg-orange-50 border border-orange-200 rounded-lg p-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded shadow-sm">
                              {offer.discountPercent}% OFF
                            </span>
                            <span className="text-sm font-semibold text-orange-900">{offer.title}</span>
                          </div>
                          {offer.discountCode && (
                            <div className="text-xs font-bold text-orange-800 bg-orange-100 border border-orange-200 px-2 py-1 rounded font-mono">
                              Code: {offer.discountCode}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Wholesale Pricing Table */}
                  {product.wholesaleTiers && product.wholesaleTiers.length > 0 && (
                    <div className="mb-6 border border-amber-200 bg-amber-50 rounded-xl overflow-hidden">
                      <div className="bg-amber-100/50 px-4 py-2 border-b border-amber-200">
                        <h4 className="text-sm font-bold text-amber-900 flex items-center gap-2">
                          <Zap className="h-4 w-4" /> Bulk Pricing Deals
                        </h4>
                      </div>
                      <div className="p-3">
                        <div className="grid grid-cols-2 gap-2 text-sm font-semibold text-gray-700">
                          {product.wholesaleTiers
                            .slice()
                            .sort((a, b) => a.minQuantity - b.minQuantity)
                            .map((tier, idx) => (
                              <div key={idx} className="flex justify-between items-center bg-white border border-amber-100 rounded-lg px-3 py-2">
                                <span>{tier.minQuantity}+ units</span>
                                <span className="text-emerald-600">₹{tier.price.toLocaleString('en-IN')}/ea</span>
                              </div>
                            ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center gap-4 mb-4">
                    {/* Quantity Selector */}
                    <div className="flex items-center border border-gray-300 bg-white rounded-lg h-12">
                      <button 
                        onClick={() => handleQtyChange('dec')}
                        className="px-4 text-gray-500 hover:text-black font-medium h-full"
                      >
                        −
                      </button>
                      <span className="w-8 text-center font-bold text-gray-900">{qty}</span>
                      <button 
                        onClick={() => handleQtyChange('inc')}
                        className="px-4 text-gray-500 hover:text-black font-medium h-full"
                      >
                        +
                      </button>
                    </div>

                    {/* Add to Cart Button */}
                    <button 
                      onClick={addToCartHandler}
                      disabled={product.countInStock === 0}
                      className={`flex-1 h-12 rounded-lg font-bold text-slate-900 transition-colors ${product.countInStock > 0 ? 'bg-[#f69c36] hover:bg-[#e88d25]' : 'bg-gray-300 cursor-not-allowed'}`}
                    >
                      Add to Cart
                    </button>
                  </div>

                  {/* Request Bulk Quote Button */}
                  <button 
                    onClick={() => setShowEnquiry(true)}
                    className="w-full h-12 mb-6 rounded-lg font-bold text-gray-700 border-2 border-gray-300 bg-white hover:border-gray-400 transition-colors flex items-center justify-center gap-2"
                  >
                    Request Custom Bulk Quote
                  </button>

                  {/* Delivery Estimate Box */}
                  <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
                    <h3 className="font-bold text-gray-900 mb-4">Delivery Estimate</h3>
                    
                    <div className="flex items-start gap-2 mb-4">
                      <MapPin className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-sm text-gray-600">Deliver to: </span>
                        <span className="text-sm font-bold text-gray-900 underline decoration-gray-300 underline-offset-2 cursor-pointer">Site Location</span>
                      </div>
                    </div>

                    <div className="flex items-end justify-between mt-6">
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Estimated Delivery by:</p>
                        <p className="font-bold text-gray-900">{formattedDeliveryDate}</p>
                      </div>
                      <div className="text-amber-500 opacity-80">
                        {/* A simple truck/box icon representation similar to the screenshot */}
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                          <path d="M4 6H20V16H4V6ZM6 8V14H18V8H6Z" opacity="0.3"/>
                          <path d="M2 4V18H6V20H10V18H14V20H18V18H22V4H2ZM20 16H4V6H20V16Z" />
                          <circle cx="8" cy="19" r="2"/>
                          <circle cx="16" cy="19" r="2"/>
                        </svg>
                      </div>
                    </div>
                  </div>

                  <a href="#" className="text-sm font-bold text-gray-900 underline underline-offset-2 hover:text-amber-600 transition-colors mt-auto inline-block w-fit">
                    Need Financing?
                  </a>
                </div>
              </div>

            </div>

            {/* Bottom Sections */}
            <div className="mt-16 max-w-4xl">
              {/* Product Highlights & Benefits */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Product Highlights & Benefits</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-10">
                  {highlights.map((highlight, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center shrink-0 border border-amber-100">
                        {highlight.icon}
                      </div>
                      <span className="text-gray-700 font-medium">{highlight.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technical Specifications */}
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Technical Specifications</h2>
                <div className="border border-gray-200 rounded-2xl overflow-hidden">
                  <div className="divide-y divide-gray-200">
                    {specs.map((spec, index) => (
                      <div key={index} className="flex flex-col sm:flex-row">
                        <div className="bg-gray-50/50 p-4 sm:w-1/3 text-sm font-bold text-gray-700">
                          {spec.label}
                        </div>
                        <div className="p-4 sm:w-2/3 text-sm text-gray-600 bg-white">
                          {spec.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Reviews Section */}
              <div className="mt-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>
                {(!product.reviews || product.reviews.length === 0) && (
                  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center">
                    <p className="text-gray-500">No reviews yet.</p>
                  </div>
                )}
                <div className="space-y-6">
                  {product.reviews && product.reviews.map((review, index) => (
                    <div key={index} className="bg-white border border-gray-200 rounded-2xl p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-bold text-gray-900">{review.name}</h4>
                          <p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`h-4 w-4 ${
                                star <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bulk Enquiry Modal */}
            {showEnquiry && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
                  <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-6 text-white text-center">
                    <h3 className="text-2xl font-black mb-1">Request a Quote</h3>
                    <p className="text-sm font-medium opacity-90">For massive orders beyond our standard tiers.</p>
                  </div>
                  <form onSubmit={submitEnquiryHandler} className="p-6">
                    <div className="mb-4">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Product</label>
                      <input type="text" disabled value={product.name} className="w-full bg-gray-100 border border-gray-200 rounded-lg p-3 text-gray-500 font-medium" />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Estimated Quantity Needed</label>
                      <input 
                        type="number" 
                        required 
                        min="1"
                        placeholder="e.g. 500"
                        value={enquiryQty} 
                        onChange={(e) => setEnquiryQty(e.target.value)} 
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-amber-400 outline-none" 
                      />
                    </div>
                    <div className="mb-6">
                      <label className="block text-sm font-bold text-gray-700 mb-2">Additional Notes / Delivery Requirements</label>
                      <textarea 
                        rows="3" 
                        required
                        placeholder="e.g. Need this delivered in tons to a high-security construction site."
                        value={enquiryNotes} 
                        onChange={(e) => setEnquiryNotes(e.target.value)} 
                        className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-amber-400 outline-none" 
                      ></textarea>
                    </div>
                    <div className="flex gap-3">
                      <button 
                        type="button" 
                        onClick={() => setShowEnquiry(false)}
                        className="flex-1 py-3 rounded-lg font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        disabled={enquiryLoading}
                        className="flex-1 py-3 rounded-lg font-bold text-slate-900 bg-amber-400 hover:bg-amber-500 transition-colors flex justify-center items-center"
                      >
                        {enquiryLoading ? <div className="h-5 w-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div> : 'Submit Enquiry'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProductPage;
