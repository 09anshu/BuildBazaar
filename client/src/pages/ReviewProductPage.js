import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { createProductReview, listProductDetails, resetReviewResult } from '../store/slices/productSlice';
import { Star } from 'lucide-react';
import getImageUrl from '../utils/getImageUrl';

const ReviewProductPage = () => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');

  const { id: productId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { product, loading, error } = useSelector((state) => state.products);
  const { userInfo } = useSelector((state) => state.auth);
  const { loading: loadingReview, error: errorReview, success: successReview } = useSelector((state) => state.products.reviewResult || {});

  useEffect(() => {
    if (!userInfo) {
      navigate('/login');
      return;
    }
    if (!product._id || product._id !== productId) {
      dispatch(listProductDetails(productId));
    }
  }, [dispatch, navigate, productId, product._id, userInfo]);

  useEffect(() => {
    if (successReview) {
      toast.success('Review submitted successfully!');
      dispatch(resetReviewResult());
      navigate(`/product/${productId}`);
    }
    if (errorReview) {
      toast.error(errorReview);
      dispatch(resetReviewResult());
    }
  }, [successReview, errorReview, navigate, productId, dispatch]);

  const submitHandler = (e) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    dispatch(createProductReview({
      productId,
      review: { rating, comment }
    }));
  };

  return (
    <div className="bg-gray-100 min-h-screen pt-10 px-4 pb-20">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm p-8">
        <div className="mb-6">
          <Link to="/myorders" className="text-blue-600 hover:underline text-sm font-medium">
            &larr; Back to Orders
          </Link>
        </div>

        <h1 className="text-3xl font-bold mb-8">Write a Review</h1>

        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amazon_blue"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 text-red-700 p-4 rounded-md mb-6">{error}</div>
        ) : (
          <div>
            <div className="flex items-center space-x-6 mb-8 pb-8 border-b border-gray-200">
              {product.image && (
                <img 
                  src={getImageUrl(product.image)} 
                  alt={product.name} 
                  className="h-24 w-24 object-contain"
                />
              )}
              <div>
                <h2 className="text-xl font-medium text-gray-900">{product.name}</h2>
                <p className="text-gray-500 text-sm mt-1">{product.brand}</p>
              </div>
            </div>

            <form onSubmit={submitHandler}>
              <div className="mb-8">
                <label className="block text-lg font-bold text-gray-800 mb-4">Overall rating</label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      className="focus:outline-none transition-colors"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                    >
                      <Star
                        className={`h-10 w-10 ${
                          star <= (hoverRating || rating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <label className="block text-lg font-bold text-gray-800 mb-4">Add a written review</label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg p-4 focus:ring-2 focus:ring-amber-400 focus:border-transparent outline-none transition-all"
                  rows="6"
                  placeholder="What did you like or dislike? What did you use this product for?"
                  value={comment}
                  required
                  onChange={(e) => setComment(e.target.value)}
                ></textarea>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={loadingReview}
                  className="bg-amber-400 text-slate-900 font-bold py-3 px-8 rounded-lg hover:bg-amber-500 shadow-sm transition-colors flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed min-w-[160px]"
                >
                  {loadingReview ? (
                    <div className="h-5 w-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    'Submit Review'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewProductPage;
