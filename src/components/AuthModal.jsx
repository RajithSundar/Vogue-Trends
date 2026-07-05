import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, User, LogOut, CheckCircle, Database, Package, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function AuthModal({ isOpen, onClose, token, user, onLogin, onLogout }) {
  const [activeTab, setActiveTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  
  // UI States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [orders, setOrders] = useState([]);
  const [dbStatus, setDbStatus] = useState({ isUsingMongoDB: false });

  // Fetch orders and DB status on mount or tab changes
  useEffect(() => {
    // Fetch DB Status
    const fetchDbStatus = async () => {
      try {
        const res = await fetch('/api/db-status');
        if (res.ok) {
          const data = await res.json();
          setDbStatus(data);
        }
      } catch (err) {
        console.error('Error fetching database status:', err);
      }
    };
    fetchDbStatus();
  }, [isOpen]);

  useEffect(() => {
    if (token) {
      const fetchOrders = async () => {
        try {
          const res = await fetch('/api/orders', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
            const data = await res.json();
            setOrders(data);
          }
        } catch (err) {
          console.error('Error fetching orders:', err);
        }
      };
      fetchOrders();
    } else {
      setOrders([]);
    }
  }, [token, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const url = activeTab === 'login' ? '/api/auth/login' : '/api/auth/register';
    const body = activeTab === 'login' ? { email, password } : { email, password, name };

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

      onLogin(data.token, data.user);
      setSuccess(activeTab === 'login' ? 'Successfully authenticated!' : 'Account registered successfully!');
      
      // Clean up fields
      setPassword('');
      
      setTimeout(() => {
        onClose();
        setSuccess('');
      }, 1500);

    } catch (err) {
      setError(err.message || 'Something went wrong. Ensure database server is up.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutClick = () => {
    onLogout();
    setEmail('');
    setPassword('');
    setName('');
    setSuccess('Signed out of Atelier session.');
    setTimeout(() => {
      onClose();
      setSuccess('');
    }, 1200);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-stone-900/40 backdrop-blur-xs"
          />

          {/* Modal Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.3 }}
            className="relative z-10 w-full max-w-lg rounded-none border border-editorial-line bg-white shadow-none overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header control */}
            <div className="p-5 border-b border-editorial-line flex items-center justify-between bg-[#F9F8F6]">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-editorial-ink" />
                <h3 className="font-serif text-xl italic font-normal text-editorial-ink">
                  {token ? 'The Atelier Profile' : 'The Atelier Account'}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-none border border-editorial-line text-stone-400 hover:text-editorial-ink hover:bg-stone-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Database Status Pill (Super cool MERN status badge) */}
              <div className="rounded-none border border-editorial-line bg-[#F9F8F6] p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className={`h-4 w-4 ${dbStatus.isUsingMongoDB ? 'text-emerald-600' : 'text-[#8B4513]'}`} />
                  <div>
                    <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-500">MERN DATABASE STATUS</p>
                    <p className="text-xs font-mono font-bold text-editorial-ink">
                      {dbStatus.isUsingMongoDB ? 'MongoDB Atlas Cluster Live' : 'High-Speed Local JSON Storage'}
                    </p>
                  </div>
                </div>
                <span className={`inline-block h-2.5 w-2.5 rounded-full ${dbStatus.isUsingMongoDB ? 'bg-emerald-500 animate-pulse' : 'bg-[#D2B48C]'}`} />
              </div>

              {/* Status messages */}
              {error && (
                <div className="rounded-none border border-red-200 bg-red-50 p-3.5 text-xs text-red-800 font-mono">
                  <span className="font-bold uppercase tracking-wider">Session Error:</span> {error}
                </div>
              )}
              {success && (
                <div className="rounded-none border border-editorial-line bg-[#F9F8F6] p-3.5 text-xs text-[#8B4513] font-mono flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              {token && user ? (
                /* LOGGED IN USER INTERFACE */
                <div className="space-y-6">
                  {/* Account Metadata Card */}
                  <div className="border border-editorial-line p-5 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-serif text-2xl font-normal text-editorial-ink">{user.name}</h4>
                        <p className="text-xs text-stone-500 font-mono mt-0.5">{user.email}</p>
                      </div>
                      <button
                        onClick={handleLogoutClick}
                        className="inline-flex items-center gap-1.5 rounded-none border border-editorial-line px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-stone-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-3 w-3" /> Sign Out
                      </button>
                    </div>

                    {user.preferredStyle && (
                      <div className="border-t border-editorial-line pt-3 flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase text-stone-400">Atelier Signature Vibe</span>
                        <span className="border border-editorial-line bg-[#F9F8F6] px-2.5 py-0.5 text-[9px] font-mono font-bold uppercase text-editorial-ink">
                          {user.preferredStyle}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Atelier Orders History Section */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 border-b border-editorial-line pb-2">
                      <Package className="h-4 w-4 text-editorial-ink" />
                      <h4 className="font-serif text-lg font-normal italic text-editorial-ink">
                        Past Atelier Acquisitions ({orders.length})
                      </h4>
                    </div>

                    {orders.length === 0 ? (
                      <div className="text-center py-8 border border-dashed border-editorial-line">
                        <p className="text-xs text-stone-400 font-mono uppercase tracking-wider">No Orders Registered Yet</p>
                        <p className="text-[11px] text-stone-500 mt-1 max-w-xs mx-auto">
                          Place custom coordinated capsules on our Checkout to see them beautifully preserved inside your MERN cloud ledger!
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[35vh] overflow-y-auto pr-1">
                        {orders.map((order) => (
                          <div key={order._id} className="border border-editorial-line bg-[#F9F8F6]/40 p-3.5 space-y-2">
                            <div className="flex justify-between items-start text-[10px] font-mono text-stone-500">
                              <span>ID: {order._id.substring(0, 10).toUpperCase()}...</span>
                              <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                            </div>

                            {/* Fulfillment status tracking */}
                            <div className="flex justify-between items-center text-[10px] font-mono">
                              <span className="text-stone-400 uppercase text-[9px]">Fulfillment Status:</span>
                              <span className={`px-2 py-0.5 border font-bold uppercase tracking-wider text-[8px] ${
                                order.status === 'Completed' || order.status === 'Delivered'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : order.status === 'Shipped'
                                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                                  : order.status === 'Cancelled'
                                  ? 'bg-red-50 text-red-800 border-red-200'
                                  : 'bg-stone-100 text-stone-800 border-stone-300'
                              }`}>
                                {order.status || 'Processing'}
                              </span>
                            </div>
                            
                            {/* Items previews */}
                            <div className="space-y-1.5">
                              {order.items.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center text-xs">
                                  <div className="flex items-center gap-1.5 truncate">
                                    <span className="text-[10px] font-mono text-stone-400">x{item.quantity}</span>
                                    <span className="text-editorial-ink truncate">{item.name}</span>
                                    <span className="text-[9px] font-mono bg-white border border-editorial-line px-1">{item.selectedSize}</span>
                                  </div>
                                  <span className="font-mono text-[11px] text-stone-600">${item.price * item.quantity}</span>
                                </div>
                              ))}
                            </div>

                            <div className="border-t border-editorial-line pt-2 flex justify-between items-center">
                              <div className="flex flex-col text-[10px] font-mono">
                                <span className="text-stone-400 uppercase leading-none">Total Charged</span>
                                {order.discount > 0 && <span className="text-[#8B4513] leading-none mt-1">Discount: -${order.discount}.00</span>}
                              </div>
                              <span className="font-mono text-xs font-bold text-editorial-accent">${order.total}.00</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* NOT LOGGED IN - LOGIN/REGISTER FORM */
                <div className="space-y-5">
                  {/* Selector tabs */}
                  <div className="grid grid-cols-2 border border-editorial-line">
                    <button
                      onClick={() => { setActiveTab('login'); setError(''); }}
                      className={`py-3 text-xs font-mono font-bold uppercase tracking-wider transition-colors ${
                        activeTab === 'login'
                          ? 'bg-editorial-ink text-white'
                          : 'bg-white text-stone-500 hover:bg-[#F9F8F6]'
                      }`}
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => { setActiveTab('register'); setError(''); }}
                      className={`py-3 text-xs font-mono font-bold uppercase tracking-wider transition-colors ${
                        activeTab === 'register'
                          ? 'bg-editorial-ink text-white'
                          : 'bg-white text-stone-500 hover:bg-[#F9F8F6]'
                      }`}
                    >
                      New Register
                    </button>
                  </div>

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {activeTab === 'register' && (
                      <div>
                        <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-stone-400 mb-1">
                          Full Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
                          <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Christian Dior"
                            className="w-full rounded-none border border-editorial-line bg-white py-2.5 pl-9 pr-4 text-xs outline-none focus:border-editorial-ink"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-stone-400 mb-1">
                        Atelier Email
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="e.g. dior@haute.com"
                          className="w-full rounded-none border border-editorial-line bg-white py-2.5 pl-9 pr-4 text-xs outline-none focus:border-editorial-ink"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-mono font-bold uppercase tracking-widest text-stone-400 mb-1">
                        Secure Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-400" />
                        <input
                          type="password"
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full rounded-none border border-editorial-line bg-white py-2.5 pl-9 pr-4 text-xs outline-none focus:border-editorial-ink"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full rounded-none bg-editorial-ink py-3.5 text-[10px] font-mono uppercase tracking-widest font-bold text-white shadow-none hover:bg-editorial-accent transition-colors disabled:bg-stone-300 mt-2"
                    >
                      {loading ? 'Processing Session...' : activeTab === 'login' ? 'Authenticate Account' : 'Register New Ledger'}
                    </button>
                  </form>

                  <div className="text-center pt-2 space-y-1.5">
                    <p className="text-[11px] text-stone-400 italic">
                      Sign in to synchronize your curated trend board capsules, active wishlist items, and past order logs to the unified MERN database stack.
                    </p>
                    <p className="text-[10px] text-editorial-accent font-mono uppercase bg-[#F9F8F6] border border-editorial-line p-2">
                      💡 <strong>Demo Portal Admin:</strong> Login with <strong>admin@vogue.com</strong> (password: admin123) to view administrative panels.
                    </p>
                  </div>
                </div>
              )}

            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
