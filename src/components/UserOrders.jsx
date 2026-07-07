import React, { useState, useEffect } from 'react';
import { Package, Truck, CheckCircle, Clock, SearchX, ShoppingBag, XCircle } from 'lucide-react';
import { getApiUrl } from '../utils/api.js';

export default function UserOrders({ token }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      if (!token) return;
      try {
        setLoading(true);
        const res = await fetch(getApiUrl('/api/orders'), {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) {
          throw new Error('Failed to fetch your orders.');
        }
        const data = await res.json();
        // Sort orders descending by createdAt (newest first)
        data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token]);

  // Helper for tracking timeline
  const getStepStatus = (orderStatus, step) => {
    const steps = ['Processing', 'Shipped', 'Delivered'];
    if (orderStatus === 'Cancelled') return 'cancelled';
    
    const currentIndex = steps.indexOf(orderStatus);
    const stepIndex = steps.indexOf(step);
    
    // If we're at completed, everything is done
    if (orderStatus === 'Completed') return 'completed';
    
    if (currentIndex > stepIndex) return 'completed';
    if (currentIndex === stepIndex) return 'current';
    return 'pending';
  };

  const getStepColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-emerald-600 text-white border-emerald-600';
      case 'current': return 'bg-editorial-ink text-white border-editorial-ink';
      case 'cancelled': return 'bg-red-500 text-white border-red-500';
      default: return 'bg-white text-stone-300 border-stone-200';
    }
  };

  const getLineColor = (status) => {
    return status === 'completed' || status === 'current' ? 'bg-editorial-ink' : 'bg-stone-200';
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 min-h-[60vh] py-8 z-20 relative">
      <div className="flex items-center gap-3 border-b border-editorial-line pb-4 mb-6">
        <Package className="h-6 w-6 text-editorial-ink" />
        <h2 className="text-3xl font-serif font-bold text-editorial-ink">My Orders & Tracking</h2>
      </div>

      {loading ? (
        <div className="text-center py-24 space-y-3 bg-white border border-editorial-line premium-shadow rounded-[2rem]">
          <div className="h-10 w-10 animate-spin border-4 border-stone-200 border-t-editorial-ink rounded-full mx-auto" />
          <p className="text-sm font-mono text-stone-500 uppercase tracking-widest">Retrieving ledger...</p>
        </div>
      ) : error ? (
        <div className="text-center py-16 bg-red-50 border border-red-200 rounded-[2rem]">
          <SearchX className="mx-auto h-8 w-8 text-red-500 mb-3" />
          <p className="text-red-700 font-mono text-sm">{error}</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-white border border-editorial-line premium-shadow rounded-[2rem] space-y-4">
          <ShoppingBag className="mx-auto h-12 w-12 text-stone-300" />
          <h3 className="text-lg font-bold text-stone-700">No orders placed yet.</h3>
          <p className="text-sm text-stone-500">When you purchase items, you can track their delivery status here.</p>
        </div>
      ) : (
        <div className="space-y-8">
          {orders.map((order) => (
            <div key={order._id} className="bg-white border border-editorial-line premium-shadow rounded-[1.5rem] overflow-hidden">
              
              {/* Order Header */}
              <div className="bg-[#F9F8F6] p-4 sm:p-6 border-b border-editorial-line flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-mono font-bold text-stone-400 uppercase tracking-widest">Order ID: {order._id.toUpperCase()}</p>
                  <p className="text-sm text-stone-600 font-medium">Placed on: {new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-[10px] font-mono font-bold text-stone-400 uppercase tracking-widest">Total Amount</p>
                  <p className="text-lg font-bold text-editorial-accent font-serif">${order.total}.00</p>
                </div>
              </div>

              {/* Delivery Tracking Timeline */}
              <div className="p-6 sm:p-8 border-b border-stone-100 overflow-x-auto">
                {order.status === 'Cancelled' ? (
                  <div className="flex items-center gap-3 text-red-600">
                    <XCircle className="h-6 w-6" />
                    <span className="font-bold text-lg font-serif">Order Cancelled</span>
                  </div>
                ) : (
                  <div className="relative max-w-2xl mx-auto flex justify-between items-center min-w-[300px]">
                    {/* Background track line */}
                    <div className="absolute top-1/2 left-0 right-0 h-1 bg-stone-200 -translate-y-1/2 z-0"></div>
                    
                    {/* Progress track line */}
                    <div 
                      className="absolute top-1/2 left-0 h-1 bg-editorial-ink -translate-y-1/2 z-0 transition-all duration-700 ease-in-out"
                      style={{ 
                        width: order.status === 'Completed' || order.status === 'Delivered' ? '100%' : 
                               order.status === 'Shipped' ? '50%' : '0%' 
                      }}
                    ></div>

                    {/* Step 1: Processing */}
                    <div className="relative z-10 flex flex-col items-center gap-2 w-16">
                      <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center transition-colors duration-500 ${getStepColor(getStepStatus(order.status, 'Processing'))}`}>
                        <Clock className="h-4 w-4" />
                      </div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-center text-stone-600">Processing</span>
                    </div>

                    {/* Step 2: Shipped */}
                    <div className="relative z-10 flex flex-col items-center gap-2 w-16">
                      <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center transition-colors duration-500 ${getStepColor(getStepStatus(order.status, 'Shipped'))}`}>
                        <Truck className="h-4 w-4" />
                      </div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-center text-stone-600">Shipped</span>
                    </div>

                    {/* Step 3: Delivered */}
                    <div className="relative z-10 flex flex-col items-center gap-2 w-16">
                      <div className={`h-8 w-8 rounded-full border-2 flex items-center justify-center transition-colors duration-500 ${getStepColor(getStepStatus(order.status, 'Delivered'))}`}>
                        <CheckCircle className="h-4 w-4" />
                      </div>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-center text-stone-600">Delivered</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div className="p-4 sm:p-6 bg-white">
                <h4 className="text-[11px] font-mono font-bold text-stone-400 uppercase tracking-widest mb-4">Items in Shipment</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex gap-3 border border-stone-100 p-2 rounded-lg bg-stone-50/50">
                      <img src={item.imageUrl} alt={item.name} className="h-16 w-12 object-cover border border-stone-200" />
                      <div className="flex-1 flex flex-col justify-center min-w-0">
                        <p className="text-xs font-bold text-editorial-ink truncate">{item.name}</p>
                        <div className="flex items-center gap-2 text-[10px] text-stone-500 font-mono mt-1">
                          <span>Qty: {item.quantity}</span>
                          <span>•</span>
                          <span>Size: {item.selectedSize}</span>
                        </div>
                        <p className="text-xs font-mono font-semibold text-editorial-accent mt-1">${item.price * item.quantity}.00</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Shipping Address */}
              <div className="p-4 sm:p-6 bg-[#F9F8F6] border-t border-editorial-line grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                <div>
                  <p className="font-bold text-stone-400 uppercase tracking-wider mb-1">Shipping Address</p>
                  <p className="text-editorial-ink font-semibold">{order.shippingAddress.name}</p>
                  <p className="text-stone-600">{order.shippingAddress.address}</p>
                  <p className="text-stone-600">{order.shippingAddress.city}</p>
                </div>
                <div>
                  <p className="font-bold text-stone-400 uppercase tracking-wider mb-1">Contact</p>
                  <p className="text-stone-600">{order.shippingAddress.email}</p>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
