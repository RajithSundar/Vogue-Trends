import React, { useState, useEffect } from 'react';
import { Shield, Sparkles, TrendingUp, Package, ShoppingBag, Plus, RefreshCw, CheckCircle, Database } from 'lucide-react';
import { motion } from 'motion/react';

export default function AdminPanel({ token, products, onAddProduct, onUpdateProduct, onDeleteProduct }) {
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({ price: 0, stock: 0 });
  
  // New Product form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: 85,
    stock: 100,
    category: 'Tops',
    style: 'Minimalist',
    color: 'Stone Gray',
    colorCode: '#8E8E8E',
    description: '',
    imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80',
    tagsString: 'organic, minimal, comfort',
    rating: 4.8,
    reviewsCount: 12
  });

  const fetchAllOrders = async () => {
    setLoadingOrders(true);
    setError('');
    try {
      const res = await fetch('/api/orders/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        throw new Error('Failed to retrieve system orders ledger.');
      }
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      setError(err.message || 'Error fetching system orders.');
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAllOrders();
    }
  }, [token]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      setError('');
      setSuccess('');
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) {
        throw new Error('Failed to update status in DB.');
      }

      setSuccess(`Order status updated to "${newStatus}"!`);
      // Update local state
      setOrders(orders.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
      setTimeout(() => setSuccess(''), 2500);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateSubmit = async (id) => {
    setError('');
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ price: Number(editForm.price), stock: Number(editForm.stock) })
      });
      if (!res.ok) throw new Error('Failed to update product.');
      const updated = await res.json();
      onUpdateProduct(updated);
      setSuccess('Product updated!');
      setEditingProduct(null);
      setTimeout(() => setSuccess(''), 2500);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteClick = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    setError('');
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete product.');
      onDeleteProduct(id);
      setSuccess('Product deleted!');
      setTimeout(() => setSuccess(''), 2500);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    const tags = newProduct.tagsString
      .split(',')
      .map(t => t.trim().toLowerCase())
      .filter(t => t.length > 0);

    const payload = {
      name: newProduct.name,
      price: Number(newProduct.price),
      stock: Number(newProduct.stock),
      category: newProduct.category,
      style: newProduct.style,
      color: newProduct.color,
      colorCode: newProduct.colorCode,
      description: newProduct.description || `${newProduct.style} coordinate styled in premium ${newProduct.color} canvas.`,
      imageUrl: newProduct.imageUrl,
      tags: tags.length > 0 ? tags : ['casual', 'boutique'],
      rating: Number(newProduct.rating),
      reviewsCount: Number(newProduct.reviewsCount)
    };

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error('Failed to append product to catalog.');
      }

      const added = await res.json();
      onAddProduct(added); // Pass up to update App.jsx products state
      setSuccess(`Product "${added.name}" added to inventory successfully!`);
      
      // Reset form
      setNewProduct({
        name: '',
        price: 85,
        stock: 100,
        category: 'Tops',
        style: 'Minimalist',
        color: 'Stone Gray',
        colorCode: '#8E8E8E',
        description: '',
        imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80',
        tagsString: 'organic, minimal, comfort',
        rating: 4.8,
        reviewsCount: 12
      });
      setShowAddForm(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  // Calculate Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalDiscount = orders.reduce((sum, o) => sum + (o.discount || 0), 0);
  const avgOrderValue = orders.length > 0 ? Math.round(totalRevenue / orders.length) : 0;

  return (
    <div className="space-y-8 py-4">
      {/* Header bar */}
      <div className="relative overflow-hidden rounded-none bg-editorial-ink border border-editorial-line p-6 sm:p-8 text-[#F9F8F6]">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 opacity-10">
          <Shield className="h-96 w-96 text-white stroke-[0.5]" />
        </div>
        <div className="relative max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-none bg-[#8B4513] px-3 py-1 text-[9px] font-mono tracking-widest uppercase text-white">
            <Shield className="h-3.5 w-3.5 fill-white" />
            ADMIN PORTAL LEDGER
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal italic tracking-tight">
            Centralized Business Dashboard
          </h1>
          <p className="text-xs text-stone-300 leading-relaxed font-sans">
            Monitor shop sales KPIs, modify live catalog product listings, manage customer checkout payments, and update delivery dispatch pipelines.
          </p>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="rounded-none border border-red-200 bg-red-50 p-4 text-xs text-red-800 font-mono">
          <span className="font-bold uppercase tracking-wider">Dashboard Error:</span> {error}
        </div>
      )}
      {success && (
        <div className="rounded-none border border-editorial-line bg-[#F9F8F6] p-4 text-xs text-[#8B4513] font-mono flex items-center gap-2">
          <CheckCircle className="h-4 w-4 shrink-0 text-editorial-accent" />
          <span>{success}</span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="border border-editorial-line bg-white p-5 space-y-1">
          <div className="flex justify-between items-center text-[10px] text-stone-400 font-mono uppercase tracking-wider">
            <span>Total Sales Revenue</span>
            <TrendingUp className="h-3.5 w-3.5 text-stone-400" />
          </div>
          <p className="text-2xl font-serif font-normal text-editorial-ink mt-2">${totalRevenue}.00</p>
          <span className="text-[9px] text-stone-400 font-mono block">Gross receipts from all orders</span>
        </div>

        <div className="border border-editorial-line bg-white p-5 space-y-1">
          <div className="flex justify-between items-center text-[10px] text-stone-400 font-mono uppercase tracking-wider">
            <span>Volume Checkouts</span>
            <ShoppingBag className="h-3.5 w-3.5 text-stone-400" />
          </div>
          <p className="text-2xl font-serif font-normal text-editorial-ink mt-2">{orders.length}</p>
          <span className="text-[9px] text-stone-400 font-mono block">Completed purchase records</span>
        </div>

        <div className="border border-editorial-line bg-white p-5 space-y-1">
          <div className="flex justify-between items-center text-[10px] text-stone-400 font-mono uppercase tracking-wider">
            <span>Average Order Value</span>
            <Sparkles className="h-3.5 w-3.5 text-stone-400" />
          </div>
          <p className="text-2xl font-serif font-normal text-editorial-ink mt-2">${avgOrderValue}.00</p>
          <span className="text-[9px] text-stone-400 font-mono block">Mean cart value per transaction</span>
        </div>

        <div className="border border-editorial-line bg-white p-5 space-y-1">
          <div className="flex justify-between items-center text-[10px] text-stone-400 font-mono uppercase tracking-wider">
            <span>Promo Discounts Applied</span>
            <Package className="h-3.5 w-3.5 text-stone-400" />
          </div>
          <p className="text-2xl font-serif font-normal text-editorial-ink mt-2">${totalDiscount}.00</p>
          <span className="text-[9px] text-stone-400 font-mono block">Reduction total from coupon codes</span>
        </div>
      </div>

      {/* Main Grid: Orders & Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Side: Orders dispatch manager (Span 2) */}
        <div className="lg:col-span-2 border border-editorial-line bg-white p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-editorial-line pb-3">
            <span className="text-xs font-bold text-editorial-ink uppercase tracking-widest flex items-center gap-1.5 font-mono">
              <ShoppingBag className="h-3.5 w-3.5" /> Order Fulfillment Pipeline
            </span>
            <button
              onClick={fetchAllOrders}
              className="p-1 rounded-none border border-editorial-line text-stone-400 hover:text-editorial-ink"
              title="Refresh ledger"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loadingOrders ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {loadingOrders ? (
            <div className="text-center py-16 space-y-2">
              <div className="h-8 w-8 animate-spin border-2 border-stone-200 border-t-editorial-ink rounded-full mx-auto" />
              <p className="text-[10px] text-stone-500 font-mono">Loading transaction ledger...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-editorial-line">
              <p className="text-xs text-stone-400 font-mono uppercase tracking-wider">No Orders Filed</p>
              <p className="text-[10px] text-stone-500 mt-1">Place an acquisition on the store catalog to test tracking flow.</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
              {orders.map((order) => (
                <div key={order._id} className="border border-editorial-line p-4 space-y-3 hover:bg-stone-50 transition-colors">
                  <div className="flex justify-between items-start flex-wrap gap-2 text-[10px] font-mono text-stone-500">
                    <span>ORDER ID: <span className="font-bold text-editorial-ink">{order._id.toUpperCase()}</span></span>
                    <span>FILED: {new Date(order.createdAt).toLocaleString()}</span>
                  </div>

                  {/* Shipping info */}
                  <div className="bg-[#F9F8F6] p-2.5 text-xs grid grid-cols-1 sm:grid-cols-2 gap-2 border border-editorial-line">
                    <div>
                      <span className="text-[9px] text-stone-400 font-mono uppercase block">Recipient</span>
                      <span className="font-semibold text-editorial-ink">{order.shippingAddress.name}</span>
                      <span className="text-[10px] text-stone-500 block">({order.shippingAddress.email})</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-stone-400 font-mono uppercase block">Address</span>
                      <span className="text-editorial-ink">{order.shippingAddress.address}</span>
                      <span className="text-stone-500 block">{order.shippingAddress.city}</span>
                    </div>
                  </div>

                  {/* Items list */}
                  <div className="space-y-1">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono text-stone-400">x{item.quantity}</span>
                          <span className="text-editorial-ink">{item.name}</span>
                          <span className="text-[9px] font-mono bg-white border border-editorial-line px-1">{item.selectedSize}</span>
                        </div>
                        <span className="font-mono text-[11px] text-stone-600">${item.price * item.quantity}.00</span>
                      </div>
                    ))}
                  </div>

                  {/* Totals & Status Control */}
                  <div className="border-t border-editorial-line pt-2.5 flex justify-between items-center flex-wrap gap-3">
                    <div className="flex gap-4 text-[10px] font-mono">
                      <span>Subtotal: ${order.subtotal}.00</span>
                      {order.discount > 0 && <span className="text-[#8B4513]">Disc: -${order.discount}.00</span>}
                      <span className="font-bold text-editorial-accent">Total: ${order.total}.00</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-[9px] font-mono uppercase text-stone-400">Fulfillment Status:</label>
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                        className="bg-white border border-editorial-line text-[10px] font-mono px-2 py-1 outline-none focus:border-editorial-ink"
                      >
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Product Inventory Listing Manager (Span 1) */}
        <div className="lg:col-span-1 border border-editorial-line bg-white p-6 space-y-4">
          <div className="flex justify-between items-center border-b border-editorial-line pb-3">
            <span className="text-xs font-bold text-editorial-ink uppercase tracking-widest flex items-center gap-1.5 font-mono">
              <Package className="h-3.5 w-3.5" /> Catalog Inventory ({products.length})
            </span>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="inline-flex items-center gap-1.5 rounded-none border border-editorial-line px-2 py-1 text-[9px] font-mono font-bold uppercase tracking-wider hover:bg-stone-50"
            >
              <Plus className="h-3 w-3" /> {showAddForm ? 'Close Form' : 'Add Item'}
            </button>
          </div>

          {showAddForm ? (
            /* ADD NEW PRODUCT FORM */
            <form onSubmit={handleProductSubmit} className="space-y-3.5 text-xs bg-[#F9F8F6] p-4 border border-editorial-line">
              <p className="text-[10px] font-mono font-bold uppercase text-[#8B4513]">Publish New Inventory Unit</p>
              
              <div>
                <label className="block text-[9px] font-mono uppercase text-stone-400 mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Linen Blend Blazer"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full rounded-none border border-editorial-line bg-white p-2.5 text-base sm:text-xs outline-none focus:border-editorial-ink"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] font-mono uppercase text-stone-400 mb-1">Unit Price ($)</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: Number(e.target.value) })}
                    className="w-full rounded-none border border-editorial-line bg-white p-2.5 text-base sm:text-xs outline-none focus:border-editorial-ink"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-mono uppercase text-stone-400 mb-1">Unit Stock</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: Number(e.target.value) })}
                    className="w-full rounded-none border border-editorial-line bg-white p-2.5 text-base sm:text-xs outline-none focus:border-editorial-ink"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-mono uppercase text-stone-400 mb-1">Category</label>
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  className="w-full rounded-none border border-editorial-line bg-white p-2.5 text-base sm:text-xs outline-none focus:border-editorial-ink font-mono"
                >
                  <option value="Tops">Tops</option>
                  <option value="Bottoms">Bottoms</option>
                  <option value="Outerwear">Outerwear</option>
                  <option value="Footwear">Footwear</option>
                  <option value="Accessories">Accessories</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] font-mono uppercase text-stone-400 mb-1">Style Vibe</label>
                  <select
                    value={newProduct.style}
                    onChange={(e) => setNewProduct({ ...newProduct, style: e.target.value })}
                    className="w-full rounded-none border border-editorial-line bg-white p-2.5 text-base sm:text-xs outline-none focus:border-editorial-ink font-mono"
                  >
                    <option value="Minimalist">Minimalist</option>
                    <option value="Streetwear">Streetwear</option>
                    <option value="Athleisure">Athleisure</option>
                    <option value="Classic Elegant">Classic Elegant</option>
                    <option value="Bohemian">Bohemian</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-mono uppercase text-stone-400 mb-1">Color Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sage Green"
                    value={newProduct.color}
                    onChange={(e) => setNewProduct({ ...newProduct, color: e.target.value })}
                    className="w-full rounded-none border border-editorial-line bg-white p-2.5 text-base sm:text-xs outline-none focus:border-editorial-ink"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] font-mono uppercase text-stone-400 mb-1">Hex Color Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. #2E4F4F"
                    value={newProduct.colorCode}
                    onChange={(e) => setNewProduct({ ...newProduct, colorCode: e.target.value })}
                    className="w-full rounded-none border border-editorial-line bg-white p-2.5 text-base sm:text-xs outline-none focus:border-editorial-ink font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-mono uppercase text-stone-400 mb-1">Tags (Comma Sep)</label>
                  <input
                    type="text"
                    placeholder="tag1, tag2"
                    value={newProduct.tagsString}
                    onChange={(e) => setNewProduct({ ...newProduct, tagsString: e.target.value })}
                    className="w-full rounded-none border border-editorial-line bg-white p-2.5 text-base sm:text-xs outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-mono uppercase text-stone-400 mb-1">Product Description</label>
                <textarea
                  rows={2}
                  placeholder="Fits and fabrics details..."
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full rounded-none border border-editorial-line bg-white p-2.5 text-base sm:text-xs outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-[9px] font-mono uppercase text-stone-400 mb-1">Image URL</label>
                <input
                  type="text"
                  placeholder="https://unsplash.com/..."
                  value={newProduct.imageUrl}
                  onChange={(e) => setNewProduct({ ...newProduct, imageUrl: e.target.value })}
                  className="w-full rounded-none border border-editorial-line bg-white p-2.5 text-base sm:text-xs outline-none truncate"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-none bg-editorial-ink text-white py-3 text-[10px] font-mono uppercase tracking-widest font-bold hover:bg-editorial-accent transition-colors"
              >
                Publish Product
              </button>
            </form>
          ) : (
            /* SIMPLE LIST OF CURRENT PRODUCTS */
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {products.map((p) => (
                <div key={p.id} className="flex gap-3 border-b border-stone-100 pb-3 items-center">
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="h-12 w-10 object-cover border border-editorial-line"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-editorial-ink truncate uppercase font-mono tracking-wider">{p.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5 text-[10px] text-stone-500 font-mono">
                      <span>{p.category}</span>
                      <span>•</span>
                      <span className="font-bold text-editorial-accent">${p.price}</span>
                      <span>•</span>
                      <span>Stk: {p.stock ?? 100}</span>
                    </div>
                  </div>
                  
                  {editingProduct === (p.id || p._id) ? (
                    <div className="flex flex-col gap-1.5 items-end ml-2">
                      <div className="flex gap-1">
                        <input type="number" className="w-14 text-[10px] p-1 border border-editorial-line outline-none bg-white font-mono" value={editForm.price} onChange={e => setEditForm({...editForm, price: e.target.value})} placeholder="Price" title="Price" />
                        <input type="number" className="w-14 text-[10px] p-1 border border-editorial-line outline-none bg-white font-mono" value={editForm.stock} onChange={e => setEditForm({...editForm, stock: e.target.value})} placeholder="Stock" title="Stock" />
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => setEditingProduct(null)} className="text-[9px] border border-stone-300 px-2 py-0.5 text-stone-500 uppercase tracking-widest font-bold">Cancel</button>
                        <button onClick={() => handleUpdateSubmit(p.id || p._id)} className="text-[9px] border border-editorial-ink bg-editorial-ink text-white px-2 py-0.5 uppercase tracking-widest font-bold">Save</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-3 ml-2 items-center">
                      <div
                        className="h-3 w-3 rounded-full border border-stone-300 shrink-0"
                        style={{ backgroundColor: p.colorCode }}
                        title={p.color}
                      />
                      <button onClick={() => { setEditingProduct(p.id || p._id); setEditForm({ price: p.price, stock: p.stock ?? 100 }); }} className="text-[9px] text-[#8B4513] hover:underline font-mono uppercase tracking-widest font-bold">Edit</button>
                      <button onClick={() => handleDeleteClick(p.id || p._id)} className="text-[9px] text-red-600 hover:underline font-mono uppercase tracking-widest font-bold">Del</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
