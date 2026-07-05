import React, { useState, useEffect } from 'react';
import { X, Heart, Star, Sparkles, ShoppingBag, Send, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function ProductDetailModal({
  product,
  onClose,
  onAddToCart,
  isWishlisted,
  toggleWishlist,
  onTrackView,
  token,
}) {
  const [selectedSize, setSelectedSize] = useState('M');
  const [isAdding, setIsAdding] = useState(false);
  const [showLearningLog, setShowLearningLog] = useState(false);
  
  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  // Fetch reviews from MERN server
  const fetchReviews = async () => {
    if (!product) return;
    try {
      const res = await fetch(`/api/reviews/${product.id}`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (err) {
      console.error('Error fetching product reviews:', err);
    }
  };

  // Track view & fetch reviews
  useEffect(() => {
    if (product) {
      onTrackView(product.id);
      setSelectedSize('M');
      setShowLearningLog(true);
      fetchReviews();

      const timer = setTimeout(() => {
        setShowLearningLog(false);
      }, 5000); // Pulse the AI learning alert
      return () => clearTimeout(timer);
    }
  }, [product, onTrackView]);

  if (!product) return null;

  const handleAddToCart = () => {
    setIsAdding(true);
    setTimeout(() => {
      onAddToCart(product, selectedSize);
      setIsAdding(false);
    }, 600);
  };

  const handlePostReview = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setIsSubmittingReview(true);
    setReviewError('');
    setReviewSuccess('');

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          productId: product.id,
          rating,
          comment
        })
      });

      if (!res.ok) {
        throw new Error('Could not submit review');
      }

      setReviewSuccess('Review added to Atelier ledger!');
      setComment('');
      setRating(5);
      fetchReviews();

      setTimeout(() => {
        setReviewSuccess('');
      }, 3000);
    } catch (err) {
      setReviewError('Failed to record review. Check network.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 px-4 py-6 backdrop-blur-xs">
        {/* Background Click Close */}
        <div className="absolute inset-0 cursor-pointer" onClick={onClose} />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative z-10 w-full max-w-4xl rounded-none border border-editorial-line bg-white shadow-none overflow-hidden flex flex-col md:flex-row max-h-[92vh]"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 flex h-8 w-8 items-center justify-center rounded-none border border-editorial-line bg-white text-stone-700 transition-colors hover:bg-stone-100"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Left Column: Image */}
          <div className="md:w-1/2 relative bg-stone-100 aspect-square md:aspect-auto">
            <img
              src={product.imageUrl}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            {/* Soft border styling */}
            <div className="absolute inset-0 border-r border-editorial-line hidden md:block pointer-events-none" />
          </div>

          {/* Right Column: Information & Reviews list */}
          <div className="md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto max-h-[90vh] bg-white">
            <div className="space-y-6">
              
              {/* Category, Vibe and general average stars */}
              <div className="flex items-center justify-between">
                <span className="rounded-none border border-editorial-line bg-[#F9F8F6] px-3 py-1 text-[9px] font-mono font-bold tracking-widest text-editorial-ink uppercase">
                  {product.style} Style
                </span>
                <div className="flex items-center gap-1 text-xs text-stone-700 font-mono uppercase tracking-wider">
                  <Star className="h-3.5 w-3.5 fill-editorial-accent stroke-editorial-accent" />
                  <span className="font-bold">{product.rating}</span>
                  <span className="text-stone-400">({reviews.length || product.reviewsCount} reviews)</span>
                </div>
              </div>

              {/* Title & Price */}
              <div>
                <h2 className="font-serif text-3xl font-normal text-editorial-ink leading-tight italic">
                  {product.name}
                </h2>
                
                <div className="mt-3 flex items-center justify-between border-b border-editorial-line pb-4">
                  <span className="font-serif text-2xl font-normal text-editorial-accent">
                    ${product.price}.00
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-stone-500 font-mono uppercase tracking-widest">Color:</span>
                    <div
                      className="h-4 w-4 rounded-full border border-stone-300"
                      style={{ backgroundColor: product.colorCode }}
                    />
                    <span className="text-xs font-mono uppercase tracking-wider text-stone-800">{product.color}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest font-mono">
                  Concept & Description
                </h4>
                <p className="mt-1.5 text-xs text-stone-600 leading-relaxed font-sans">
                  {product.description}
                </p>
              </div>

              {/* Size Selector */}
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest font-mono">
                    Select Size
                  </h4>
                  <span className="text-[10px] text-stone-400 underline cursor-pointer hover:text-stone-600 font-mono uppercase tracking-wider">
                    Size Guide
                  </span>
                </div>
                <div className="mt-2 flex gap-2">
                  {['XS', 'S', 'M', 'L', 'XL'].map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`flex h-10 w-12 items-center justify-center rounded-none border text-xs font-mono font-semibold tracking-widest transition-all ${
                        selectedSize === size
                          ? 'border-editorial-ink bg-editorial-ink text-white'
                          : 'border-editorial-line bg-white text-stone-800 hover:border-editorial-ink'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* MERN Reviews System Segment */}
              <div className="border-t border-editorial-line pt-5 space-y-4">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-editorial-ink" />
                  <h4 className="font-serif text-lg font-normal italic text-editorial-ink">
                    Atelier Reviews Ledger ({reviews.length})
                  </h4>
                </div>

                {/* Create/Post review form */}
                <form onSubmit={handlePostReview} className="p-3 border border-editorial-line bg-[#F9F8F6]/50 space-y-3">
                  <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500">
                    {token ? 'Publish Public Review' : 'Add Anonymous Review'}
                  </p>
                  
                  {reviewError && <p className="text-[10px] text-red-700 font-mono">{reviewError}</p>}
                  {reviewSuccess && <p className="text-[10px] text-emerald-800 font-mono">{reviewSuccess}</p>}

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-stone-400">Rating:</span>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="p-0.5 text-[#8B4513] hover:scale-110 transition-transform"
                        >
                          <Star className={`h-3.5 w-3.5 ${rating >= star ? 'fill-editorial-accent text-editorial-accent' : 'text-stone-300'}`} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <textarea
                      required
                      rows={2}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder={token ? "Tell other buyers about fit and feel..." : "Sign in to use your profile name. Write review..."}
                      className="flex-1 rounded-none border border-editorial-line bg-white p-2 text-xs outline-none focus:border-editorial-ink font-sans resize-none"
                    />
                    <button
                      type="submit"
                      disabled={isSubmittingReview || !comment.trim()}
                      className="bg-editorial-ink hover:bg-editorial-accent text-white px-3 flex items-center justify-center transition-colors disabled:bg-stone-300"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </form>

                {/* Reviews List */}
                <div className="space-y-3 max-h-[25vh] overflow-y-auto pr-1">
                  {reviews.length === 0 ? (
                    <p className="text-[11px] text-stone-400 italic">No custom reviews posted for this coordinate yet. Be the first!</p>
                  ) : (
                    reviews.map((r, idx) => (
                      <div key={r._id || idx} className="text-xs border-b border-stone-100 pb-2.5">
                        <div className="flex justify-between items-center text-[10px] text-stone-500 mb-1">
                          <span className="font-bold text-editorial-ink">{r.name}</span>
                          <span>{new Date(r.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex gap-0.5 mb-1 text-editorial-accent">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${i < r.rating ? 'fill-editorial-accent text-editorial-accent' : 'text-stone-200'}`}
                            />
                          ))}
                        </div>
                        <p className="text-stone-600 leading-normal font-sans italic">"{r.comment}"</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* AI Personalization Log Log Card */}
              <div className="flex flex-col gap-4">
                <AnimatePresence>
                  {showLearningLog && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="rounded-none border border-editorial-line bg-[#F9F8F6] p-3.5"
                    >
                      <div className="flex items-start gap-2.5">
                        <Sparkles className="h-4 w-4 text-editorial-accent shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h5 className="text-[10px] font-mono font-bold uppercase tracking-widest text-editorial-accent">
                            Personalizer Engine Active
                          </h5>
                          <p className="text-[11px] text-stone-600 leading-normal mt-0.5">
                            The system records your interest profile to form curated stylist capsules. Registered attributes:
                          </p>
                          <div className="mt-1.5 flex flex-wrap gap-1.5 text-[9px] font-mono">
                            <span className="border border-editorial-line bg-white px-2 py-0.5 text-stone-700">
                              CAT: {product.category}
                            </span>
                            <span className="border border-editorial-line bg-white px-2 py-0.5 text-stone-700">
                              STYLE: {product.style}
                            </span>
                            <span className="border border-editorial-line bg-white px-2 py-0.5 text-stone-700">
                              COLOR: {product.color}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={isAdding}
                    className="flex-1 flex items-center justify-center gap-2 rounded-none bg-editorial-ink py-3.5 text-xs font-mono font-bold tracking-widest uppercase text-white hover:bg-editorial-accent transition-colors disabled:bg-stone-300"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    {isAdding ? 'Adding...' : 'Add to Bag'}
                  </button>

                  <button
                    onClick={() => toggleWishlist(product.id)}
                    className={`flex h-12 w-12 items-center justify-center rounded-none border transition-all ${
                      isWishlisted
                        ? 'border-[#8B4513] bg-[#8B4513]/10 text-editorial-accent'
                        : 'border-editorial-line bg-white text-stone-700 hover:border-stone-400'
                    }`}
                    title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                  >
                    <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-editorial-accent text-editorial-accent border-none' : ''}`} />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
