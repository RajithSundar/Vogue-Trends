import { getApiUrl } from './utils/api.js';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ShoppingBag, Sparkles, Filter, RefreshCw, X, ChevronDown, Flame, Heart, Info, ArrowRight, Search } from 'lucide-react';
import Navbar from './components/Navbar.jsx';
import CategoryCard from './components/CategoryCard.jsx';
import ProductCard from './components/ProductCard.jsx';
import ProductDetailModal from './components/ProductDetailModal.jsx';
import PersonalizationHub from './components/PersonalizationHub.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import TrendSection from './components/TrendSection.jsx';
import AuthModal from './components/AuthModal.jsx';
import AdminPanel from './components/AdminPanel.jsx';
import CollectionTab from './components/CollectionTab.jsx';
import ThreeDCarousel from './components/ThreeDCarousel.jsx';
import ThreeDCylinderCarousel from './components/lightswind/3DCarousel.tsx';
import ImageMarquee from './components/ImageMarquee.jsx';
import AnimatedButton from './components/AnimatedButton.jsx';
import { InteractiveGridBackground } from './components/ui/InteractiveGridBackground.tsx';
import { StarsBackgroundDemo } from './components/ui/background.tsx';
import { TextReveal } from './components/ui/text-reveal.tsx';
import SlidingCards from './components/lightswind/SlidingCards.tsx';
import { CylinderCarousel } from '../components/motion/cylinder-carousel.tsx';
import { TiltCard } from '../components/motion/tilt-card.tsx';
import { motion, AnimatePresence } from 'motion/react';

const CATEGORY_IMAGES = {
  'All': 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80',
  'Tops': 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80',
  'Bottoms': 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&q=80',
  'Outerwear': 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80',
  'Footwear': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
  'Accessories': 'https://images.unsplash.com/photo-1509319117193-57bab727e09d?w=600&q=80',
  'Kids': '/images/kids.png'
};

const categoryItems = [
  {
    id: 1,
    title: "Men's Collection",
    brand: "MEN",
    description: "Explore tailored fits, rugged outerwear, and everyday essentials.",
    tags: ["Tailored", "Rugged", "Essentials"],
    imageUrl: "https://images.unsplash.com/photo-1516257984-b1b4d707412e?q=80&w=2940&auto=format&fit=crop",
    link: "#",
    styleVibe: "Men"
  },
  {
    id: 2,
    title: "Women's Collection",
    brand: "WOMEN",
    description: "Discover elegant silhouettes, vibrant prints, and timeless pieces.",
    tags: ["Elegant", "Vibrant", "Timeless"],
    imageUrl: "https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2940&auto=format&fit=crop",
    link: "#",
    styleVibe: "Women"
  },
  {
    id: 3,
    title: "Outerwear Collection",
    brand: "OUTERWEAR",
    description: "Premium jackets and coats designed for any weather.",
    tags: ["Warm", "Durable"],
    imageUrl: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=2940&q=80",
    link: "#",
    styleVibe: "Outerwear"
  },
  {
    id: 4,
    title: "Accessories",
    brand: "ACCESSORIES",
    description: "The perfect finishing touches to elevate any outfit.",
    tags: ["Jewelry", "Bags", "Hats"],
    imageUrl: "https://images.unsplash.com/photo-1509319117193-57bab727e09d?q=80&w=2940&auto=format&fit=crop",
    link: "#",
    styleVibe: "Accessories"
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
  const navigate = useNavigate();
  const location = useLocation();

  // Navigation & Cart States
  const [activeTab, setActiveTab] = useState('shop');
  const [activeTrend, setActiveTrend] = useState(null);
  const [activeExclusiveTag, setActiveExclusiveTag] = useState(null);
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

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showWishlistOnly, setShowWishlistOnly] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState('All');
  const [selectedColor, setSelectedColor] = useState('All');
  const [maxPrice, setMaxPrice] = useState(220);
  const [initialStylistQuery, setInitialStylistQuery] = useState(null);
  const [triggerChatScroll, setTriggerChatScroll] = useState(0);

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
          const meRes = await fetch(getApiUrl('/api/auth/me'), {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          
          if (meRes.ok) {
            const userData = await meRes.json();
            setUser(userData);
            localStorage.setItem('vogue_user', JSON.stringify(userData));

            // Sync Cart from Database
            const cartRes = await fetch(getApiUrl('/api/cart'), {
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
            const wishRes = await fetch(getApiUrl('/api/wishlist'), {
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
        const res = await fetch(getApiUrl('/api/products'));
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

  // Sync URL pathname with internal navigation state
  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/shop/')) {
      const tag = decodeURIComponent(path.slice(6));
      setActiveExclusiveTag(tag);
      setActiveTab('collection');
    } else if (path === '/deals') {
      setActiveTab('deals');
      setActiveExclusiveTag(null);
    } else if (path === '/stylist') {
      setActiveTab('stylist');
      setActiveExclusiveTag(null);
    } else if (path === '/trends') {
      setActiveTab('trends');
      setActiveExclusiveTag(null);
    } else if (path === '/admin') {
      setActiveTab('admin');
      setActiveExclusiveTag(null);
    } else if (path === '/wishlist') {
      setActiveTab('wishlist');
      setActiveExclusiveTag(null);
    } else {
      setActiveTab('shop');
      setActiveExclusiveTag(null);
    }
  }, [location.pathname]);

  // Dynamic offer cards derived from products collection
  const dealTags = ['Summer Sale', 'New Arrivals', 'Members Only'];
  const offerCards = useMemo(() => {
    if (products.length === 0) return [];
    return dealTags.map((tag, index) => {
      const taggedProducts = products.filter(p => p.tags && p.tags.includes(tag));
      const first = taggedProducts[0];
      return {
        id: index + 1,
        tag,
        title: tag,
        description: taggedProducts.length > 0
          ? `${taggedProducts.length} Products Available`
          : 'Coming Soon',
        productCount: taggedProducts.length,
        imageUrl: first?.imageUrl || 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=80'
      };
    });
  }, [products]);

  // 2. LocalStorage & Server-DB sync helpers
  const saveCart = async (items) => {
    setCartItems(items);
    localStorage.setItem('vogue_cart', JSON.stringify(items));
    if (token) {
      try {
        await fetch(getApiUrl('/api/cart'), {
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
        await fetch(getApiUrl('/api/wishlist'), {
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
    <div className="min-h-screen flex flex-col bg-[#F9F8F6] relative overflow-clip">
      
      {/* Global Interactive Background */}
      <StarsBackgroundDemo />

      <div className="relative z-10 flex flex-col flex-1">
      
      {/* Upper Navigation Rail */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        cartCount={cartTotalCount}
        wishlistCount={wishlist.length}
onWishlistClick={() => {
           navigate('/wishlist');
         }}
        openCart={() => setIsCartOpen(true)}
        browsingCount={browsingHistory.length}
        searchQuery={searchQuery}
setSearchQuery={(val) => {
           setSearchQuery(val);
           if (val && activeTab !== 'shop') {
             navigate('/');
           }
         }}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Main Container Stage */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        
        {/* TAB 5: DEALS PAGE */}
        {activeTab === 'deals' && (
          <div className="space-y-8 min-h-[60vh] flex flex-col items-center justify-center py-12">
             <h2 className="text-4xl md:text-5xl font-serif font-bold text-editorial-ink">Exclusive Deals & Offers</h2>
             <p className="text-editorial-muted text-center max-w-lg mb-8">Discover our latest promotions, flash sales, and new arrivals. Stay ahead of the trends.</p>
             <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-8">
                {offerCards.map(c => (
                   <CategoryCard
                     key={c.id}
                     id={c.id}
                     tag={c.tag}
                     title={c.title}
                     subtitle={c.productCount > 0 ? `${c.productCount} Products Available` : c.description}
                     imageUrl={c.imageUrl}
                   />
                ))}
             </div>
          </div>
        )}

        {/* TAB 6: WISHLIST PAGE */}
        {activeTab === 'wishlist' && (
          <div className="space-y-8 min-h-[60vh] flex flex-col py-12 w-full max-w-6xl mx-auto z-20 relative">
             <div className="text-center mb-8">
               <h2 className="text-4xl md:text-5xl font-serif font-bold text-editorial-ink">Your Wishlist</h2>
               <p className="text-editorial-muted mt-4">Curated pieces you love.</p>
             </div>
             
             {wishlist.length === 0 ? (
               <div className="text-center py-20 bg-white rounded-[2rem] border border-stone-200/50 shadow-sm max-w-2xl mx-auto w-full">
                 <p className="text-sm font-semibold text-stone-700">Your wishlist is currently empty.</p>
                 <button
                   onClick={() => navigate('/')}
                   className="mt-6 rounded-full bg-editorial-ink px-8 py-4 text-xs font-bold text-white uppercase tracking-widest hover:bg-black transition-colors"
                 >
                   Explore the Catalogue
                 </button>
               </div>
             ) : (
               <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 bg-white border border-editorial-line p-6 sm:p-8 md:p-12 rounded-[2rem] premium-shadow glow-bg">
                 <AnimatePresence>
                   {products.filter(p => wishlist.includes(p.id)).map((p) => (
                     <ProductCard
                        key={p.id}
                        product={p}
                        onViewDetails={setSelectedProduct}
                        isWishlisted={true}
                        toggleWishlist={handleToggleWishlist}
                        preferredStyle={preferredStyle}
                     />
                   ))}
                 </AnimatePresence>
               </div>
             )}
          </div>
        )}

        {/* TAB 1: STORE / SHOP DISCOVERY VIEW */}
        {activeTab === 'shop' && (
          <div className="space-y-8">
            {/* HERO SECTION WITH INTERACTIVE GRID */}
            <TiltCard className="w-full max-w-6xl mx-auto mb-16" max={5} glare={true}>
              <div 
                className="relative w-full h-[300px] md:h-[400px] rounded-[2rem] overflow-hidden bg-white border border-editorial-line premium-shadow flex flex-col items-center justify-center p-6 group transition-all duration-500 glow-bg"
              >
                  {/* Clickable Background overlay */}
                  <div onClick={() => {
                    navigate('/stylist');
                    setTriggerChatScroll(prev => prev + 1);
                  }} className="absolute inset-0 z-0 cursor-pointer"></div>
                  
                  <div className="relative z-10 flex flex-col items-center pointer-events-auto">
                    <div onClick={() => {
                      navigate('/stylist');
                      setTriggerChatScroll(prev => prev + 1);
                    }} className="cursor-pointer mb-8">
                      <TextReveal text="CONSULT AI STYLIST." stagger={0.08} delay={1.2} className="text-4xl md:text-6xl font-serif italic text-editorial-ink font-bold text-center drop-shadow-sm tracking-tighter group-hover:scale-105 transition-transform duration-500" />
                    </div>
                    
                    <div className="w-full max-w-lg relative group/input">
                      <input 
                        type="text" 
                        placeholder="What should I wear for..." 
                        onKeyDown={(e) => {
if (e.key === 'Enter' && e.target.value.trim()) {
                               setInitialStylistQuery(e.target.value);
                               navigate('/stylist');
                               setTriggerChatScroll(prev => prev + 1);
                           }
                        }}
                         className="w-full px-8 py-4 rounded-full bg-stone-50 border-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.06)] outline-none focus:bg-white focus:shadow-[inset_0_1px_2px_rgba(0,0,0,0.03),_0_4px_12px_rgba(0,0,0,0.05)] text-editorial-ink placeholder:text-stone-400 font-sans transition-all pr-14 text-sm md:text-base"
                      />
                      <button 
                        onClick={(e) => {
                          const val = e.currentTarget.previousSibling.value;
if (val.trim()) {
                             setInitialStylistQuery(val);
                             navigate('/stylist');
                             setTriggerChatScroll(prev => prev + 1);
                          }
                        }}
                        className="absolute right-2 top-2 bottom-2 aspect-square bg-editorial-ink text-white rounded-full flex items-center justify-center hover:bg-editorial-accent transition-colors shadow-sm"
                      >
                        &rarr;
                      </button>
                    </div>
                  </div>
              </div>
            </TiltCard>



            {/* CURRENT OFFERS SLIDING CARDS */}
            <div className="w-full max-w-6xl mx-auto mb-20 flex flex-col md:flex-row items-center gap-12 bg-white p-8 md:p-12 rounded-[2rem] border border-editorial-line premium-shadow glow-bg">
              
              <div className="flex-1 space-y-5 relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-[10px] font-bold uppercase tracking-widest mb-2">
                  <Flame className="w-3 h-3" /> Flash Deals
                </div>
                <h2 className="font-serif text-4xl font-bold text-editorial-ink tracking-tight leading-tight">
                  Exclusive Offers <br/><span className="italic font-light text-stone-500">Just for You.</span>
                </h2>
                <p className="text-stone-500 leading-relaxed text-sm max-w-md">
                  Swipe through our latest promotions and popular picks. Grab these limited-time deals before they're gone!
                </p>
                <div className="pt-4">
                  <AnimatedButton onClick={() => navigate('/deals')} variant="dark" icon="arrow">
                    Shop All Deals
                  </AnimatedButton>
                </div>
              </div>
              
              <div className="flex-1 flex justify-center min-h-[380px] w-full relative z-10">
                <SlidingCards 
                  cards={offerCards.map(c => ({
                    id: c.id,
                    title: c.title,
                    tag: c.tag,
                    description: c.description,
                    icon: <img src={c.imageUrl} className="w-full h-full object-cover rounded-xl" />,
                    bgClass: 'bg-white'
                  }))} 
                  autoPlay={true} 
                  autoPlayInterval={3500} 
                  cardSize="w-20 h-20" 
                  className="mx-auto" 
                  onCardClick={(index) => {
                    navigate(`/shop/${encodeURIComponent(offerCards[index].tag)}`);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </div>
            </div>


            {/* NEW CATALOGUE LAYOUT */}
            {!selectedCategory ? (
              <div className="w-full max-w-6xl mx-auto mb-20 bg-white border border-editorial-line premium-shadow rounded-[2rem] p-6 sm:p-8 md:p-12 relative overflow-hidden flex flex-col space-y-8 sm:space-y-12 items-center z-20 glow-bg">
                <div className="text-center">
                  <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-editorial-ink">The Catalogue</h2>
                  <p className="text-xs text-stone-500 font-mono mt-2 uppercase tracking-widest">Select a Category</p>
                </div>
                
                 <div className="w-full">
                    {/* Mobile: Horizontal Scrolling Container */}
                    <div className="w-full sm:hidden">
                      <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory py-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                        {['All', 'Tops', 'Bottoms', 'Outerwear', 'Footwear', 'Accessories', 'Kids'].map((cat) => (
                         <div 
                           key={cat}
                           onClick={() => setSelectedCategory(cat)}
                           className="snap-center flex-shrink-0 w-[180px] h-[260px] cursor-pointer rounded-[2rem] transition-all duration-300 border border-[#e5e5e5] bg-white relative group hover:border-editorial-ink/30 premium-shadow"
                         >
                            <div className="absolute inset-0 rounded-[2rem] overflow-hidden">
                              <img src={CATEGORY_IMAGES[cat]} alt={cat} className="absolute inset-0 w-full h-full object-cover brightness-[0.85] contrast-[1.1] transition-all duration-500 group-hover:brightness-[0.95]" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent transition-opacity duration-500 group-hover:opacity-90"></div>
                              <div className="absolute inset-0 z-10 p-4 flex flex-col items-center justify-center">
                                <h3 className="font-serif text-xl font-bold text-white drop-shadow-md tracking-wide text-center leading-tight">{cat}</h3>
                                <p className="text-[9px] uppercase tracking-widest mt-2 text-white/90 font-mono drop-shadow-sm font-semibold text-center">View {cat === 'All' ? 'Everything' : 'Collection'}</p>
                              </div>
                            </div>
                         </div>
                       ))}
                      </div>
                    </div>

                    {/* Tablet & Desktop: 3D Cylinder Carousel */}
                    <div className="hidden sm:block">
                      <CylinderCarousel 
                        visibleItems={5} 
                        itemWidth={220} 
                        itemHeight={320} 
                        height={460} 
                        radius={2000} 
                        minScale={0.75} 
                        className="w-full"
                      >
                         {['All', 'Tops', 'Bottoms', 'Outerwear', 'Footwear', 'Accessories', 'Kids'].map((cat) => (
                           <div 
                             key={cat} 
                             onPointerDownCapture={() => setSelectedCategory(cat)}
                             className="w-[220px] h-[320px] mx-auto cursor-pointer rounded-[2rem] transition-all duration-300 border border-[#e5e5e5] bg-white relative group hover:border-editorial-ink/30 premium-shadow"
                           >
                              <div className="absolute inset-0 rounded-[2rem] overflow-hidden">
                                <img src={CATEGORY_IMAGES[cat]} alt={cat} className="absolute inset-0 w-full h-full object-cover brightness-[0.85] contrast-[1.1] transition-all duration-500 group-hover:brightness-[0.95]" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent transition-opacity duration-500 group-hover:opacity-90"></div>
                                <div className="absolute inset-0 z-10 p-6 flex flex-col items-center justify-center">
                                  <h3 className="font-serif text-2xl md:text-3xl font-bold text-white drop-shadow-md tracking-wide text-center leading-tight">{cat}</h3>
                                  <p className="text-[10px] uppercase tracking-widest mt-3 text-white/90 font-mono drop-shadow-sm font-semibold text-center">View {cat === 'All' ? 'Everything' : 'Collection'}</p>
                                </div>
                              </div>
                           </div>
                         ))}
                      </CylinderCarousel>
                    </div>
                 </div>
              </div>
            ) : (
              <div className="w-full flex flex-col space-y-12 items-center relative z-20">
                <div className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-4 border-b border-editorial-line gap-4">
                     <div>
                       <button onClick={() => setSelectedCategory(null)} className="inline-flex items-center justify-center gap-2 rounded-full border border-stone-200 bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-stone-700 hover:bg-stone-50 hover:text-editorial-ink hover:border-stone-300 transition-all shadow-sm mb-4 group">
                          <span className="group-hover:-translate-x-1 transition-transform">&larr;</span> Back to Categories
                       </button>
                       <h3 className="font-serif text-3xl md:text-4xl font-bold text-editorial-ink tracking-tight">
                         {selectedCategory === 'All' ? 'All Pieces' : `${selectedCategory} Collection`}
                       </h3>
                     </div>
                     <span className="text-xs font-mono text-stone-600 uppercase tracking-widest bg-stone-100 px-4 py-2 rounded-full font-semibold">{filteredProducts.length} Items</span>
                  </div>
                  
                  {isLoadingProducts ? (
                    <div className="text-center py-24 space-y-3">
                      <div className="h-10 w-10 animate-spin border-4 border-stone-200 border-t-stone-900 rounded-full mx-auto" />
                    </div>
                  ) : filteredProducts.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-[2rem] border border-stone-200/50 space-y-3 shadow-sm">
                      <p className="text-sm font-semibold text-stone-700">No matching garments found</p>
                      <button
                        onClick={() => setSelectedCategory(null)}
                        className="mt-2 rounded-full bg-editorial-ink px-6 py-3 text-xs font-bold text-white uppercase tracking-widest hover:bg-black transition-colors"
                      >
                        Reset Category
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
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
            )}

          </div>
        )}

        {/* TAB 1.5: EXCLUSIVE COLLECTION */}
        {activeTab === 'collection' && activeExclusiveTag && (
          <CollectionTab 
            activeTag={activeExclusiveTag}
            products={products}
            user={user}
            token={token}
            onProductClick={setSelectedProduct}
            setIsAuthOpen={setIsAuthOpen}
            setUser={setUser}
            wishlist={wishlist}
            toggleWishlist={handleToggleWishlist}
            preferredStyle={preferredStyle}
          />
        )}

        {/* TAB 2: AI STYLIST / PERSONALIZATION DASHBOARD */}
        {activeTab === 'stylist' && (
          <PersonalizationHub
            products={products}
            browsingHistory={browsingHistory}
            onProductClick={setSelectedProduct}
            onAddMultipleToCart={handleAddMultipleToCart}
            initialStylistQuery={initialStylistQuery}
            onClearInitialQuery={() => setInitialStylistQuery(null)}
            triggerChatScroll={triggerChatScroll}
          />
        )}

        {/* TAB 3: TREND BOARD & COLOR THEORIES */}
        {activeTab === 'trends' && (
          <TrendSection
            onSelectTrendStyle={(trend) => {
              setActiveTrend(trend);
              setActiveTab('trend-details');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            setActiveTab={setActiveTab}
          />
        )}

        {/* TAB 3.5: TREND DETAILS */}
        {activeTab === 'trend-details' && activeTrend && (
          <div className="space-y-8 py-12 w-full max-w-6xl mx-auto z-20 relative">
             <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 pb-4 border-b border-editorial-line gap-4">
                 <div>
                   <button onClick={() => setActiveTab('trends')} className="inline-flex items-center justify-center gap-2 rounded-full border border-stone-200 bg-white px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-stone-700 hover:bg-stone-50 hover:text-editorial-ink hover:border-stone-300 transition-all shadow-sm mb-4 group">
                      <span className="group-hover:-translate-x-1 transition-transform">&larr;</span> Back to Trends
                   </button>
                   <h3 className="font-serif text-3xl md:text-4xl font-bold text-editorial-ink tracking-tight">
                     {activeTrend?.name} Collection
                   </h3>
                 </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 bg-white border border-editorial-line p-6 sm:p-8 md:p-12 rounded-[2rem] premium-shadow glow-bg">
                <AnimatePresence>
                  {products.filter(p => p.style === activeTrend?.vibe).map((p) => (
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
          </div>
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
    </div>
  );
}
 
 
