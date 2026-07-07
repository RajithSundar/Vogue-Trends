import React, { useState, useEffect } from 'react';
import { X, ShoppingBag, Trash2, ChevronRight, Loader2, Database, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getApiUrl } from '../utils/api.js';

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  token,
  user,
  onOpenAuth,
}) {
  const [checkoutStep, setCheckoutStep] = useState('cart');
  const [checkoutForm, setCheckoutForm] = useState({
    name: 'Jane Doe',
    email: 'jane.doe@vogue.com',
    address: '108 Fashion Ave, Suite 400',
    city: 'New York, NY 10018',
    card: '•••• •••• •••• 4242',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  
  // Promo code states
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');
  const [appliedPromo, setAppliedPromo] = useState('');

  // Auto populate user info if logged in
  useEffect(() => {
    if (user) {
      setCheckoutForm(prev => ({
        ...prev,
        name: user.name,
        email: user.email,
      }));
    }
  }, [user, isOpen]);

  const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const discount = Math.round(subtotal * (appliedPromo === 'VOGUE20' ? 0.2 : appliedPromo === 'WELCOME10' ? 0.1 : 0));
  const delivery = subtotal > 150 ? 0 : 15;
  const total = Math.max(0, subtotal - discount + delivery);

  const handleApplyPromo = (e) => {
    e.preventDefault();
    setPromoError('');
    const code = promoInput.trim().toUpperCase();
    if (code === 'VOGUE20') {
      setAppliedPromo('VOGUE20');
      setPromoInput('');
    } else if (code === 'WELCOME10') {
      setAppliedPromo('WELCOME10');
      setPromoInput('');
    } else {
      setPromoError('Invalid coupon code.');
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo('');
    setPromoError('');
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    setCheckoutError('');
    setIsSubmitting(true);

    const orderPayload = {
      items: cartItems.map(item => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        selectedSize: item.selectedSize,
        imageUrl: item.product.imageUrl
      })),
      subtotal,
      deliveryFee: delivery,
      discount,
      total,
      shippingAddress: {
        name: checkoutForm.name,
        email: checkoutForm.email,
        address: checkoutForm.address,
        city: checkoutForm.city
      }
    };

    if (token) {
      try {
        const res = await fetch(getApiUrl('/api/orders'), {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(orderPayload)
        });
        if (!res.ok) {
          throw new Error('Order submission failed in the MERN database ledger.');
        }
        setAppliedPromo(''); // Reset promo code on success
        setCheckoutStep('success');
      } catch (err) {
        setCheckoutError(err.message || 'Error writing order to MongoDB Atlas.');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      setCheckoutError('You must be signed in to place an order.');
      setIsSubmitting(false);
    }
  };

  const handleCompleteOrder = () => {
    onClearCart();
    setCheckoutStep('cart');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop click close */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs cursor-pointer"
        />

        {/* Sliding Panel */}
        <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 180 }}
            className="w-screen max-w-md bg-white flex flex-col shadow-2xl h-full border-l border-stone-200"
          >
            {/* Header */}
            <div className="p-6 border-b border-editorial-line flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-editorial-ink" />
                <h3 className="font-serif text-xl font-normal text-editorial-ink">
                  Shopping Bag
                </h3>
                <span className="border border-editorial-line bg-white text-stone-700 text-[10px] px-2 py-0.5 rounded-none font-mono font-bold">
                  {cartItems.length}
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-none border border-editorial-line text-stone-400 hover:text-editorial-ink hover:bg-stone-50 relative before:absolute before:-inset-3 before:content-['']"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* CART VIEW */}
            {checkoutStep === 'cart' && (
              <div className="flex-1 flex flex-col min-h-0 bg-white">
                {cartItems.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4">
                    <div className="h-16 w-16 rounded-none bg-[#F9F8F6] flex items-center justify-center text-stone-400 border border-editorial-line">
                      <ShoppingBag className="h-8 w-8 stroke-[1.2]" />
                    </div>
                    <div className="max-w-[240px]">
                      <h4 className="text-xs font-bold text-stone-800 font-mono uppercase tracking-wider">Your Bag is Empty</h4>
                      <p className="text-xs text-stone-500 mt-1 leading-normal">
                        Fill it with stylish coordinates or consult our AI stylist to formulate outfit capsules!
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Item list */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                      {cartItems.map((item, idx) => {
                        const { product, quantity, selectedSize } = item;
                        return (
                          <div key={`${product.id}-${selectedSize}-${idx}`} className="flex gap-4 border-b border-stone-100 pb-4">
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              referrerPolicy="no-referrer"
                              loading="lazy"
                              className="h-20 w-16 object-cover bg-stone-50 border border-editorial-line flex-shrink-0"
                            />
                            <div className="flex-1 flex flex-col justify-between min-w-0">
                              <div>
                                <div className="flex justify-between items-start gap-1">
                                  <h4 className="text-xs font-semibold text-editorial-ink truncate">{product.name}</h4>
                                  <span className="font-mono text-xs text-stone-900">${product.price * quantity}</span>
                                </div>
                                <div className="flex items-center gap-2 mt-1 text-[10px] text-stone-500 font-mono">
                                  <span>{product.color}</span>
                                  <span>•</span>
                                  <span className="bg-stone-100 px-1.5 py-0.5 border border-stone-200">SIZE: {selectedSize}</span>
                                </div>
                              </div>

                              <div className="flex justify-between items-center mt-2">
                                {/* Quantity Toggles */}
                                <div className="flex items-center border border-editorial-line">
                                  <button
                                    onClick={() => onUpdateQuantity(product.id, selectedSize, quantity - 1)}
                                    className="px-2 py-0.5 text-xs hover:bg-[#F9F8F6] font-bold relative before:absolute before:-inset-2 before:content-['']"
                                  >
                                    -
                                  </button>
                                  <span className="px-2 text-xs font-mono font-medium">{quantity}</span>
                                  <button
                                    onClick={() => onUpdateQuantity(product.id, selectedSize, quantity + 1)}
                                    className="px-2 py-0.5 text-xs hover:bg-[#F9F8F6] font-bold relative before:absolute before:-inset-2 before:content-['']"
                                  >
                                    +
                                  </button>
                                </div>

                                <button
                                  onClick={() => onRemoveItem(product.id, selectedSize)}
                                  className="text-stone-400 hover:text-red-600 transition-colors relative before:absolute before:-inset-3 before:content-['']"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Footer Summary */}
                    <div className="p-6 pb-8 md:pb-6 border-t border-editorial-line bg-[#F9F8F6] space-y-4">
                      <div className="space-y-1.5 text-xs font-mono">
                        <div className="flex justify-between text-stone-500">
                          <span>Subtotal</span>
                          <span>${subtotal}.00</span>
                        </div>
                        <div className="flex justify-between text-stone-500">
                          <span>Delivery</span>
                          <span>{delivery === 0 ? 'Complimentary' : `$${delivery}.00`}</span>
                        </div>
                        <div className="border-t border-editorial-line pt-2 flex justify-between font-bold text-editorial-ink">
                          <span>Estimated Total</span>
                          <span className="text-editorial-accent">${total}.00</span>
                        </div>
                      </div>

                      {/* Go to Checkout */}
                      {token ? (
                        <button
                          onClick={() => setCheckoutStep('checkout')}
                          className="w-full rounded-none bg-editorial-ink py-3.5 text-[10px] font-mono uppercase tracking-widest font-bold text-white shadow-none hover:bg-editorial-accent transition-colors flex items-center justify-center gap-1.5"
                        >
                          Proceed to Checkout
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => { onOpenAuth(); }}
                          className="w-full rounded-none bg-editorial-ink py-3.5 text-[10px] font-mono uppercase tracking-widest font-bold text-white shadow-none hover:bg-editorial-accent transition-colors flex items-center justify-center gap-1.5"
                        >
                          Sign In to Checkout
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* CHECKOUT FORM VIEW */}
            {checkoutStep === 'checkout' && (
              <div className="flex-1 flex flex-col min-h-0 p-6 pb-8 md:pb-6 overflow-y-auto bg-white">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-serif text-xl font-normal text-editorial-ink italic">
                    Checkout Details
                  </h4>
                  {token && (
                    <span className="inline-flex items-center gap-1 text-[9px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-100 px-2 py-0.5">
                      <Database className="h-2.5 w-2.5" /> MERN Linked
                    </span>
                  )}
                </div>

                {checkoutError && (
                  <div className="p-2.5 bg-red-50 border border-red-100 text-[10px] text-red-800 font-mono mb-3">
                    {checkoutError}
                  </div>
                )}

                <form onSubmit={handleCheckout} className="space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-stone-400 mb-1">
                        Shipping Recipient
                      </label>
                      <input
                        type="text"
                        required
                        value={checkoutForm.name}
                        onChange={(e) => setCheckoutForm({ ...checkoutForm, name: e.target.value })}
                        className="w-full rounded-none border border-editorial-line bg-white px-4 py-2.5 text-xs outline-none focus:border-editorial-ink"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-stone-400 mb-1">
                        Contact Email
                      </label>
                      <input
                        type="email"
                        required
                        value={checkoutForm.email}
                        onChange={(e) => setCheckoutForm({ ...checkoutForm, email: e.target.value })}
                        className="w-full rounded-none border border-editorial-line bg-white px-4 py-2.5 text-xs outline-none focus:border-editorial-ink"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-stone-400 mb-1">
                        Street Address
                      </label>
                      <input
                        type="text"
                        required
                        value={checkoutForm.address}
                        onChange={(e) => setCheckoutForm({ ...checkoutForm, address: e.target.value })}
                        className="w-full rounded-none border border-editorial-line bg-white px-4 py-2.5 text-xs outline-none focus:border-editorial-ink"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-stone-400 mb-1">
                        City, State & Zip Code
                      </label>
                      <input
                        type="text"
                        required
                        value={checkoutForm.city}
                        onChange={(e) => setCheckoutForm({ ...checkoutForm, city: e.target.value })}
                        className="w-full rounded-none border border-editorial-line bg-white px-4 py-2.5 text-xs outline-none focus:border-editorial-ink"
                      />
                    </div>

                    <div className="pt-2">
                      <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-stone-400 mb-1">
                        Demo Card Details (Safe Mocked)
                      </label>
                      <input
                        type="text"
                        required
                        value={checkoutForm.card}
                        onChange={(e) => setCheckoutForm({ ...checkoutForm, card: e.target.value })}
                        className="w-full rounded-none border border-editorial-line bg-stone-50 px-4 py-2.5 text-xs text-stone-400 outline-none"
                        readOnly
                      />
                    </div>

                    {/* Promo Code Discount Segment */}
                    <div className="pt-4 border-t border-editorial-line space-y-2">
                      <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-stone-400">
                        Promo Code Discount
                      </label>
                      {appliedPromo ? (
                        <div className="flex items-center justify-between bg-stone-50 border border-editorial-line p-2 text-xs font-mono">
                          <span className="text-editorial-ink font-bold">Applied: {appliedPromo} (-{appliedPromo === 'VOGUE20' ? '20%' : '10%'})</span>
                          <button
                            type="button"
                            onClick={handleRemovePromo}
                            className="text-[9px] text-[#8B4513] hover:underline uppercase font-bold"
                          >
                            Remove
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={promoInput}
                              onChange={(e) => setPromoInput(e.target.value)}
                              placeholder="e.g. VOGUE20"
                              className="flex-1 rounded-none border border-editorial-line bg-white px-3 py-1.5 text-xs outline-none focus:border-editorial-ink font-mono"
                            />
                            <button
                              type="button"
                              onClick={handleApplyPromo}
                              className="bg-editorial-ink text-white px-4 py-1.5 text-[9px] font-mono uppercase font-bold hover:bg-editorial-accent"
                            >
                              Apply
                            </button>
                          </div>
                          {promoError && (
                            <p className="text-[9px] text-red-700 font-mono">{promoError}</p>
                          )}
                          <p className="text-[9px] text-stone-400 italic">
                            Demo codes: VOGUE20 (20% off) | WELCOME10 (10% off)
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-editorial-line pt-4 mt-6 space-y-2 text-xs font-mono">
                    <div className="flex justify-between text-stone-500">
                      <span>Subtotal:</span>
                      <span>${subtotal}.00</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-[#8B4513]">
                        <span>Promo Discount ({appliedPromo}):</span>
                        <span>-${discount}.00</span>
                      </div>
                    )}
                    <div className="flex justify-between text-stone-500">
                      <span>Delivery Fee:</span>
                      <span>{delivery === 0 ? 'Complimentary' : `$${delivery}.00`}</span>
                    </div>
                    <div className="border-t border-editorial-line pt-2 flex justify-between font-bold text-editorial-ink uppercase">
                      <span>Total Charge:</span>
                      <span className="text-editorial-accent font-extrabold">${total}.00</span>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <button
                        type="button"
                        onClick={() => setCheckoutStep('cart')}
                        className="w-1/3 rounded-none border border-editorial-line py-3 text-[10px] font-mono uppercase font-bold text-stone-500 hover:bg-[#F9F8F6]"
                      >
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 rounded-none bg-editorial-ink py-3 text-[10px] font-mono uppercase tracking-widest font-bold text-white shadow-none hover:bg-editorial-accent transition-colors flex items-center justify-center gap-2 disabled:bg-stone-300"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin" />
                            Recording...
                          </>
                        ) : (
                          'Dispatch Order'
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}

            {/* SUCCESS VIEW */}
            {checkoutStep === 'success' && (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-5 bg-white">
                <div className="h-16 w-16 rounded-none bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-200">
                  <CheckCircle className="h-8 w-8 stroke-[1.2]" />
                </div>
                <div className="max-w-[280px]">
                  <h4 className="font-serif text-2xl font-normal text-editorial-ink italic">Capsule Order Placed!</h4>
                  <p className="text-xs text-stone-500 mt-2 leading-relaxed">
                    Thank you for your acquisition. Your order record has been successfully registered in the MERN cloud cluster.
                  </p>
                </div>
                <button
                  onClick={handleCompleteOrder}
                  className="rounded-none bg-editorial-ink px-6 py-3 text-[10px] font-mono uppercase tracking-widest font-bold text-white shadow-none hover:bg-editorial-accent transition-colors"
                >
                  Continue Browsing
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
