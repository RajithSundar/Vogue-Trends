import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ShoppingBag, Sparkles, Filter, RefreshCw, X, ChevronDown, Flame, Heart, Info, ArrowRight } from 'lucide-react';
import Navbar from './components/Navbar.jsx';
import ProductCard from './components/ProductCard.jsx';
import ProductDetailModal from './components/ProductDetailModal.jsx';
import PersonalizationHub from './components/PersonalizationHub.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import TrendSection from './components/TrendSection.jsx';
import AuthModal from './components/AuthModal.jsx';
import AdminPanel from './components/AdminPanel.jsx';
import ThreeDCarousel from './components/ThreeDCarousel.jsx';
import ImageMarquee from './components/ImageMarquee.jsx';
import AnimatedButton from './components/AnimatedButton.jsx';
import { motion, AnimatePresence } from 'motion/react';

const carouselItems = [
  {
    id: 1,
    title: "Organic Linens & Textured Suede",
    brand: "Seasonal Edit",
    description: "Curated tailored edits with premium organic fibers, grounding pigments, and structured drape overlays.",
    tags: ["Sustainable", "Premium", "Minimalist"],
    imageUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=1200&auto=format&fit=crop&q=80",
    link: "#",
    styleVibe: "Minimalist"
  },
  {
    id: 2,
    title: "Urban Utility & Techwear",
    brand: "Streetwear",
    description: "High-performance fabrics meeting avant-garde silhouettes for the modern cityscape.",
    tags: ["Techwear", "Utility", "Urban"],
    imageUrl: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=1200&auto=format&fit=crop&q=80",
    link: "#",
    styleVibe: "Streetwear"
  },
  {
    id: 3,
    title: "Timeless Tailoring",
    brand: "Classic Elegant",
    description: "Sartorial excellence with sharp lines, muted tones, and perfect proportions.",
    tags: ["Tailored", "Classic", "Elegant"],
    imageUrl: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1200&auto=format&fit=crop&q=80",
    link: "#",
    styleVibe: "Classic Elegant"
  }
];

const marqueeItems = [
  { id: "1", src: "https://upload.wikimedia.org/wikipedia/commons/2/20/Adidas_Logo.svg", alt: "Adidas", link: "#" },
  { id: "2", src: "https://upload.wikimedia.org/wikipedia/commons/a/a6/Logo_NIKE.svg", alt: "Nike", link: "#" },
  { id: "3", src: "https://upload.wikimedia.org/wikipedia/commons/7/7b/Prada-Logo.svg", alt: "Prada", link: "#" },
  { id: "4", src: "https://upload.wikimedia.org/wikipedia/commons/c/c5/Gucci_logo.svg", alt: "Gucci", link: "#" },
  { id: "5", src: "https://upload.wikimedia.org/wikipedia/commons/f/fd/Zara_Logo.svg", alt: "Zara", link: "#" },
  { id: "6", src: "https://upload.wikimedia.org/wikipedia/commons/a/a8/Chanel_logo.svg", alt: "Chanel", link: "#" },
];

export default function App() {
  // Navigation & Cart States
  const [activeTab, setActiveTab] = useState('shop');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  
  // Auth States (MERN Stack session management)
  const [token, setToken] = useState(localStorage.getItem('vogue_token'));
  const [user, setUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Products Catalog
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showWishlistOnly, setShowWishlistOnly] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState('All');
  const [selectedColor, setSelectedColor] = useState('All');
  const [maxPrice, setMaxPrice] = useState(220);

  // Personalization Track State
  const [browsingHistory, setBrowsingHistory] = useState([]);

  // Auth helper callbacks
  const handleLogin = (newToken, newUser) => {
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('vogue_token', newToken);
    localStorage.setItem('vogue_user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('vogue_token');
    localStorage.removeItem('vogue_user');
    // Clean up local items on sign out
    setCartItems([]);
    setWishlist([]);
  };

  // MERN DB Session & Cart/Wishlist Synchronization Effect
  useEffect(() => {
    if (token) {
      const fetchUserAndSync = async () => {
        try {
          // Fetch current verified user
          const meRes = await fetch('/api/auth/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (meRes.ok) {
            const userData = await meRes.json();
            setUser(userData);
            localStorage.setItem('vogue_user', JSON.stringify(userData));

            // Sync Cart from Database
            const cartRes = await fetch('/api/cart', {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (cartRes.ok) {
              const dbCartItems = await cartRes.json();
              if (dbCartItems && dbCartItems.length > 0) {
                const mappedCartItems = dbCartItems.map((dbItem) => {
                  const product = products.find(p => p.id === dbItem.productId);
                  return product ? { product, quantity: dbItem.quantity, selectedSize: dbItem.selectedSize } : null;
                }).filter(Boolean);
                if (mappedCartItems.length > 0) {
                  setCartItems(mappedCartItems);
                }
              }
            }

            // Sync Wishlist from Database
            const wishRes = await fetch('/api/wishlist', {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (wishRes.ok) {
              const dbWishProductIds = await wishRes.json();
              if (dbWishProductIds && dbWishProductIds.length > 0) {
                setWishlist(dbWishProductIds);
              }
            }
          } else {
            // Invalid session token, clean up session
            handleLogout();
          }
        } catch (err) {
          console.error('Error synchronizing database session:', err);
        }
      };
      
      if (products.length > 0) {
        fetchUserAndSync();
      }
    }
  }, [token, products.length]);


  // 1. Load initial storage values & fetch product catalog
  useEffect(() => {
    // Local storage reading
    const storedCart = localStorage.getItem('vogue_cart');
    const storedWish = localStorage.getItem('vogue_wishlist');
    const storedHist = localStorage.getItem('vogue_history');

    if (storedCart) {
      try { setCartItems(JSON.parse(storedCart)); } catch (e) { console.error(e); }
    }
    if (storedWish) {
      try { setWishlist(JSON.parse(storedWish)); } catch (e) { console.error(e); }
    }
    if (storedHist) {
      try { setBrowsingHistory(JSON.parse(storedHist)); } catch (e) { console.error(e); }
    }

    // Fetch products
    const fetchProducts = async () => {
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          setProducts(data);
        } else {
          // If server fails, import locally
          const mod = await import('./data/products.js');
          setProducts(mod.PRODUCTS);
        }
      } catch (err) {
        console.warn('API connection refused. Loading products locally.', err);
        const mod = await import('./data/products.js');
        setProducts(mod.PRODUCTS);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchProducts();
  }, []);

  // 2. LocalStorage & Server-DB sync helpers
  const saveCart = async (items) => {
    setCartItems(items);
    localStorage.setItem('vogue_cart', JSON.stringify(items));
    if (token) {
      try {
        await fetch('/api/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            items: items.map(it => ({
              productId: it.product.id,
              quantity: it.quantity,
              selectedSize: it.selectedSize
            }))
          })
        });
      } catch (err) {
        console.error('Error auto-syncing cart to MERN backend:', err);
      }
    }
  };

  const saveWishlist = async (ids) => {
    setWishlist(ids);
    localStorage.setItem('vogue_wishlist', JSON.stringify(ids));
    if (token) {
      try {
        await fetch('/api/wishlist', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ productIds: ids })
        });
      } catch (err) {
        console.error('Error auto-syncing wishlist to MERN backend:', err);
      }
    }
  };

  const saveHistory = (events) => {
    setBrowsingHistory(events);
    localStorage.setItem('vogue_history', JSON.stringify(events));
  };

  // 3. AI Personalization Tracking Event Emitters
  const trackBrowsingEvent = useCallback((productId, action) => {
    const newEvent = {
      productId,
      timestamp: Date.now(),
      action,
    };
    
    // Keep last 30 history events for quick local learning, filter duplicates for immediate views to prevent inflation
    setBrowsingHistory((prev) => {
      // If it is a duplicate 'view' within the same short period, ignore to prevent artificial noise
      const existsRecently = prev.some(
        (e) => e.productId === productId && e.action === action && Date.now() - e.timestamp < 30000
      );
      if (existsRecently) return prev;
      
      const updated = [newEvent, ...prev].slice(0, 30);
      localStorage.setItem('vogue_history', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Calculate real-time favorite style based on browsing events for real-time Badge decoration
  const preferredStyle = useMemo(() => {
    if (browsingHistory.length === 0) return null;
    const styleCounts = {};
    browsingHistory.forEach((event) => {
      const p = products.find((prod) => prod.id === event.productId);
      if (p) {
        styleCounts[p.style] = (styleCounts[p.style] || 0) + 1;
      }
    });
    const sorted = Object.entries(styleCounts).sort((a, b) => b[1] - a[1]);
    return sorted[0]?.[0] || null;
  }, [browsingHistory, products]);

  // 4. Cart Action handlers
  const handleAddToCart = (product, size) => {
    const existingIndex = cartItems.findIndex(
      (item) => item.product.id === product.id && item.selectedSize === size
    );

    let updated;
    if (existingIndex > -1) {
      updated = [...cartItems];
      updated[existingIndex].quantity += 1;
    } else {
      updated = [...cartItems, { product, quantity: 1, selectedSize: size }];
    }

    saveCart(updated);
    trackBrowsingEvent(product.id, 'add_to_cart');
  };

  const handleAddMultipleToCart = (productsToAdd) => {
    let updated = [...cartItems];
    productsToAdd.forEach((product) => {
      const existingIndex = updated.findIndex(
        (item) => item.product.id === product.id && item.selectedSize === 'M'
      );
      if (existingIndex > -1) {
        updated[existingIndex].quantity += 1;
      } else {
        updated.push({ product, quantity: 1, selectedSize: 'M' });
      }
      trackBrowsingEvent(product.id, 'add_to_cart');
    });
    saveCart(updated);
  };

  const handleUpdateCartQuantity = (productId, size, quantity) => {
    if (quantity <= 0) {
      handleRemoveCartItem(productId, size);
      return;
    }
    const updated = cartItems.map((item) =>
      item.product.id === productId && item.selectedSize === size
        ? { ...item, quantity }
        : item
    );
    saveCart(updated);
  };

  const handleRemoveCartItem = (productId, size) => {
    const updated = cartItems.filter(
      (item) => !(item.product.id === productId && item.selectedSize === size)
    );
    saveCart(updated);
  };

  const handleClearCart = () => {
    saveCart([]);
  };

  const handleAddProduct = (newProd) => {
    // Map _id to id if necessary, though newProd already comes from backend where we could have mapped it, 
    // or just ensure we use newProd.id or newProd._id seamlessly
    const prodWithId = { ...newProd, id: newProd.id || newProd._id };
    setProducts((prev) => [...prev, prodWithId]);
  };

  const handleUpdateProduct = (updatedProd) => {
    setProducts((prev) => prev.map(p => p.id === (updatedProd.id || updatedProd._id) ? { ...updatedProd, id: updatedProd.id || updatedProd._id } : p));
  };

  const handleDeleteProduct = (productId) => {
    setProducts((prev) => prev.filter(p => p.id !== productId && p._id !== productId));
  };

  // 5. Wishlist handlers
  const handleToggleWishlist = (productId) => {
    let updated;
    const isWish = wishlist.includes(productId);
    if (isWish) {
      updated = wishlist.filter((id) => id !== productId);
    } else {
      updated = [...wishlist, productId];
      trackBrowsingEvent(productId, 'add_to_wishlist');
    }
    saveWishlist(updated);
  };

  // 6. Filtering lists
  const availableColors = useMemo(() => {
    const colors = new Set(products.map((p) => p.color));
    return Array.from(colors);
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesStyle = selectedStyle === 'All' || p.style === selectedStyle;
      const matchesColor = selectedColor === 'All' || p.color === selectedColor;
      const matchesPrice = p.price <= maxPrice;
      const matchesWishlist = !showWishlistOnly || wishlist.includes(p.id);

      return matchesSearch && matchesCategory && matchesStyle && matchesColor && matchesPrice && matchesWishlist;
    });
  }, [products, searchQuery, selectedCategory, selectedStyle, selectedColor, maxPrice, showWishlistOnly, wishlist]);

  // Handle Editorial Trend Triggering
  const handleSelectTrendStyle = (vibe) => {
    setSelectedStyle(vibe);
    setSelectedCategory('All');
    setSelectedColor('All');
    setMaxPrice(220);
    setSearchQuery('');
  };

  const resetAllFilters = () => {
    setSelectedCategory('All');
    setSelectedStyle('All');
    setSelectedColor('All');
    setMaxPrice(220);
    setSearchQuery('');
    setShowWishlistOnly(false);
  };

  const cartTotalCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#F9F8F6]">
      
      {/* Upper Navigation Rail */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartCount={cartTotalCount}
        wishlistCount={wishlist.length}
        onWishlistClick={() => {
          setShowWishlistOnly(!showWishlistOnly);
          if (activeTab !== 'shop') setActiveTab('shop');
        }}
        openCart={() => setIsCartOpen(true)}
        browsingCount={browsingHistory.length}
        searchQuery={searchQuery}
        setSearchQuery={(val) => {
          setSearchQuery(val);
          if (val && activeTab !== 'shop') {
            setActiveTab('shop');
          }
        }}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Main Container Stage */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        
        {/* TAB 1: STORE / SHOP DISCOVERY VIEW */}
        {activeTab === 'shop' && (
          <div className="space-y-8">
            
            {/* Elegant Hero Banner - Replaced with Lightswind 3D Carousel */}
            <div className="w-full -mx-4 sm:-mx-6 lg:-mx-8">
              <ThreeDCarousel 
                items={carouselItems}
                autoRotate={true}
                rotateInterval={5000}
                cardHeight={480}
                onExplore={(item) => {
                  handleSelectTrendStyle(item.styleVibe);
                  window.scrollTo({ top: 800, behavior: 'smooth' });
                }}
              />
              <ImageMarquee items={marqueeItems} speed={60} />
            </div>

            {/* Quick info cards for the user style profile */}
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
              <div className="relative bg-white p-6 border border-editorial-line space-y-4 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-1.5 text-editorial-accent">
                    <Sparkles className="h-4 w-4 fill-editorial-accent" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider font-mono">Personalizer Active</span>
                  </div>
                  {preferredStyle ? (
                    <div>
                      <p className="text-base font-serif italic text-editorial-ink">
                        {preferredStyle} Aesthetic
                      </p>
                      <p className="text-[10px] text-editorial-text font-mono mt-1">
                        Decorating catalog items with custom <span className="text-editorial-ink font-bold">Style Match</span> tags.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs text-editorial-text leading-normal">
                        Stylist is currently idle. Click and view products to activate personalized matching tags!
                      </p>
                    </div>
                  )}
                </div>
                
                <AnimatedButton
                  onClick={() => setActiveTab('stylist')}
                  variant="dark"
                  icon="arrow"
                  fullWidth={false}
                  className="w-full md:w-auto shrink-0 shadow-md"
                >
                  Consult AI Stylist
                </AnimatedButton>
              </div>
            </div>

            {/* Shop Listing Grid Layout */}
            <div className="flex flex-col xl:flex-row gap-8 items-start">
              
              {/* Desktop & Mobile Filters Sidebar */}
              <div className="w-full xl:w-64 shrink-0">
                <div className="xl:hidden mb-4">
                  <button
                    onClick={() => setIsMobileFiltersOpen(!isMobileFiltersOpen)}
                    className="w-full bg-editorial-ink text-white py-3 text-xs font-mono font-bold uppercase tracking-[0.15em] flex items-center justify-center gap-2 rounded-none touch-target"
                  >
                    <Filter className="h-4 w-4 -ml-1" />
                    <span className="translate-x-[0.075em]">{isMobileFiltersOpen ? 'Hide Filters' : 'Show Filters'}</span>
                  </button>
                </div>
                <aside className={`${isMobileFiltersOpen ? 'block' : 'hidden'} xl:block bg-white border border-editorial-line rounded-none p-5 sticky top-24 mb-6 xl:mb-0`}>
                  <div className="flex items-center justify-between border-b border-editorial-line pb-3 mb-4">
                  <span className="text-xs font-bold text-editorial-ink uppercase tracking-widest flex items-center gap-1.5 font-mono">
                    <Filter className="h-3.5 w-3.5" /> Filter Catalog
                  </span>
                  <button
                    onClick={resetAllFilters}
                    className="text-[10px] text-stone-400 hover:text-editorial-ink font-semibold uppercase tracking-wider font-mono"
                  >
                    Reset
                  </button>
                </div>

                <div className="space-y-5 text-sm">
                  {/* Category Filter */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest font-mono block">Category</span>
                    <div className="flex flex-col gap-1">
                      {['All', 'Tops', 'Bottoms', 'Outerwear', 'Footwear', 'Accessories'].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`text-left px-2.5 py-1.5 rounded-none text-xs font-mono uppercase tracking-wider transition-all ${
                            selectedCategory === cat
                              ? 'bg-editorial-ink text-white font-bold'
                              : 'text-stone-600 hover:bg-stone-50 hover:text-editorial-ink'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Style Filter */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest font-mono block">Style Vibe</span>
                    <div className="flex flex-col gap-1">
                      {['All', 'Minimalist', 'Streetwear', 'Athleisure', 'Classic Elegant', 'Bohemian'].map((sty) => (
                        <button
                          key={sty}
                          onClick={() => setSelectedStyle(sty)}
                          className={`text-left px-2.5 py-1.5 rounded-none text-xs font-mono uppercase tracking-wider transition-all ${
                            selectedStyle === sty
                              ? 'bg-editorial-ink text-white font-bold'
                              : 'text-stone-600 hover:bg-stone-50 hover:text-editorial-ink'
                          }`}
                        >
                          {sty}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Colors Filter */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest font-mono block">Filter Color</span>
                    <div className="relative">
                      <select
                        value={selectedColor}
                        onChange={(e) => setSelectedColor(e.target.value)}
                        className="w-full bg-stone-50 border border-editorial-line rounded-none px-2.5 py-1.5 text-xs text-editorial-ink outline-none font-mono"
                      >
                        <option value="All">All Colors</option>
                        {availableColors.map((col) => (
                          <option key={col} value={col}>
                            {col}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Max Price Filter */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-[10px] font-semibold text-stone-400 uppercase tracking-widest font-mono">
                      <span>Max Price</span>
                      <span className="font-mono text-editorial-ink font-bold">${maxPrice}</span>
                    </div>
                    <input
                      type="range"
                      min="25"
                      max="220"
                      step="5"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Number(e.target.value))}
                      className="w-full accent-editorial-accent cursor-pointer"
                    />
                  </div>
                </div>
                </aside>
              </div>

              {/* Main Catalog grid section */}
              <div className="flex-1 space-y-6">
                
                {/* Visual stats and active filters header */}
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="font-serif text-3xl font-normal text-editorial-ink tracking-tight">
                      Curated Wardrobe Catalogue
                    </h3>
                    <p className="text-xs text-editorial-muted mt-0.5">
                      Showing {filteredProducts.length} premium pieces available for pairing
                    </p>
                  </div>

                  {/* Display active filter status labels */}
                  <div className="flex flex-wrap gap-1.5">
                    {selectedCategory !== 'All' && (
                      <span className="border border-editorial-line bg-white text-stone-700 rounded-none px-2.5 py-0.5 text-[9px] font-mono uppercase">
                        {selectedCategory}
                      </span>
                    )}
                    {selectedStyle !== 'All' && (
                      <span className="border border-editorial-line bg-white text-stone-700 rounded-none px-2.5 py-0.5 text-[9px] font-mono uppercase">
                        {selectedStyle}
                      </span>
                    )}
                    {selectedColor !== 'All' && (
                      <span className="border border-editorial-line bg-white text-stone-700 rounded-none px-2.5 py-0.5 text-[9px] font-mono uppercase">
                        {selectedColor}
                      </span>
                    )}
                    {maxPrice < 220 && (
                      <span className="border border-editorial-line bg-white text-stone-700 rounded-none px-2.5 py-0.5 text-[9px] font-mono uppercase">
                        &lt; ${maxPrice}
                      </span>
                    )}
                    {showWishlistOnly && (
                      <span className="border border-[#8B4513] bg-[#8B4513]/10 text-[#8B4513] rounded-none px-2.5 py-0.5 text-[9px] font-mono uppercase flex items-center gap-1">
                        <Heart className="h-2.5 w-2.5 fill-current" /> Liked Only
                      </span>
                    )}
                  </div>
                </div>

                {/* Grid */}
                {isLoadingProducts ? (
                  <div className="text-center py-24 space-y-3">
                    <div className="h-10 w-10 animate-spin border-4 border-stone-200 border-t-stone-900 rounded-full mx-auto" />
                    <p className="text-xs text-stone-500 font-mono">Unpacking boutique wardrobe...</p>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="text-center py-20 bg-stone-50 rounded-2xl border border-stone-200/50 space-y-3">
                    <p className="text-sm font-semibold text-stone-700">No matching garments found</p>
                    <p className="text-xs text-stone-500 max-w-sm mx-auto">
                      Adjust your category, style filters, or max price range to see our full available line.
                    </p>
                    <button
                      onClick={resetAllFilters}
                      className="mt-2 rounded-xl bg-stone-900 px-4 py-2 text-xs font-bold text-white"
                    >
                      Reset All Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-3 sm:gap-6">
                    <AnimatePresence>
                      {filteredProducts.map((p) => (
                        <ProductCard
                           key={p.id}
                           product={p}
                           onViewDetails={setSelectedProduct}
                           isWishlisted={wishlist.includes(p.id)}
                           toggleWishlist={handleToggleWishlist}
                           preferredStyle={preferredStyle}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                )}

              </div>

            </div>

          </div>
        )}

        {/* TAB 2: AI STYLIST / PERSONALIZATION DASHBOARD */}
        {activeTab === 'stylist' && (
          <PersonalizationHub
            products={products}
            browsingHistory={browsingHistory}
            onProductClick={setSelectedProduct}
            onAddMultipleToCart={handleAddMultipleToCart}
          />
        )}

        {/* TAB 3: TREND BOARD & COLOR THEORIES */}
        {activeTab === 'trends' && (
          <TrendSection
            onSelectTrendStyle={handleSelectTrendStyle}
            setActiveTab={setActiveTab}
          />
        )}

        {/* TAB 4: ADMIN PORTAL */}
        {activeTab === 'admin' && (
          <AdminPanel
            token={token}
            products={products}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
          />
        )}

      </main>

      {/* Floating detail modal overlay */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
        isWishlisted={selectedProduct ? wishlist.includes(selectedProduct.id) : false}
        toggleWishlist={handleToggleWishlist}
        onTrackView={(id) => trackBrowsingEvent(id, 'view')}
        token={token}
      />

      {/* Shopping Bag sliding panel */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        token={token}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Account Verification Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        token={token}
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />

      {/* Luxury Footer */}
      <footer className="border-t border-stone-200 bg-white mt-20 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-3">
          <p className="font-display font-semibold tracking-wider text-xs text-stone-400">
            © 2026 VOGUE TRENDS INC. ALL RIGHTS RESERVED.
          </p>
          <p className="text-[10px] text-stone-400 max-w-md mx-auto leading-relaxed">
            All prices are styled in USD. Personalization engine matches real-time cookies and local inputs to compile custom outfit capsules using Google Gemini models.
          </p>
        </div>
      </footer>

    </div>
  );
}
