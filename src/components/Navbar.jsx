import React, { useState, useEffect } from 'react';
import { ShoppingBag, Heart, Sparkles, Search, TrendingUp, User, Shield, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function Navbar({
  activeTab,
  setActiveTab,
  cartCount,
  wishlistCount,
  onWishlistClick,
  openCart,
  browsingCount,
  searchQuery,
  setSearchQuery,
  user,
  onOpenAuth,
}) {
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Determine AI learning status based on browsing count
  const getAiLearningStatus = () => {
    if (browsingCount === 0) {
      return { label: 'AI Idle', color: 'bg-zinc-300 text-zinc-700', percentage: 0 };
    }
    if (browsingCount < 3) {
      return { label: 'AI Learning', color: 'bg-amber-100 text-amber-800 animate-pulse', percentage: Math.min(30 * browsingCount, 90) };
    }
    return { label: 'AI Personalized', color: 'bg-emerald-100 text-emerald-800 font-medium', percentage: 100 };
  };

  const status = getAiLearningStatus();

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-editorial-line bg-editorial-bg/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Hamburger & Logo Group */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="xl:hidden p-1.5 sm:p-2 -ml-2 text-stone-600 hover:text-editorial-ink transition-colors touch-target"
            aria-label="Menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          
          {/* Logo and Brand */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('shop')}>
            <span className="font-serif italic text-2xl font-bold tracking-tight text-editorial-ink">
              VOGUE<span className="font-sans not-italic text-xs font-semibold uppercase tracking-widest text-editorial-accent pl-1">.trends</span>
            </span>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="hidden xl:flex space-x-2">
          <button
            onClick={() => setActiveTab('shop')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold tracking-wider uppercase transition-all duration-200 ${
              activeTab === 'shop'
                ? 'bg-editorial-ink text-white'
                : 'text-stone-600 hover:bg-stone-100 hover:text-editorial-ink'
            }`}
          >
            <ShoppingBag className="h-3.5 w-3.5" />
            Discover Shop
          </button>
          
          <button
            onClick={() => setActiveTab('stylist')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold tracking-wider uppercase transition-all duration-200 relative ${
              activeTab === 'stylist'
                ? 'bg-editorial-ink text-white'
                : 'text-stone-600 hover:bg-stone-100 hover:text-editorial-ink'
            }`}
          >
            <Sparkles className="h-3.5 w-3.5 text-editorial-accent fill-editorial-accent" />
            AI Stylist
            {browsingCount > 0 && activeTab !== 'stylist' && (
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-editorial-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-editorial-accent"></span>
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('trends')}
            className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold tracking-wider uppercase transition-all duration-200 ${
              activeTab === 'trends'
                ? 'bg-editorial-ink text-white'
                : 'text-stone-600 hover:bg-stone-100 hover:text-editorial-ink'
            }`}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            Trend Board
          </button>

          {user?.email === 'user' && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold tracking-wider uppercase transition-all duration-200 ${
                activeTab === 'admin'
                  ? 'bg-[#8B4513] text-white'
                  : 'text-[#8B4513] hover:bg-stone-100 hover:text-[#8B4513]'
              }`}
            >
              <Shield className="h-3.5 w-3.5" />
              Admin Portal
            </button>
          )}
        </nav>

        {/* Search Bar */}
        <div className="relative max-w-xs flex-1 hidden sm:block mx-4">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-stone-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search linen, earthy, outerwear..."
            className="w-full rounded-none border border-editorial-line bg-white py-1.5 pl-9 pr-4 text-xs text-editorial-ink outline-none transition-all focus:border-editorial-ink focus:ring-1 focus:ring-editorial-ink"
          />
        </div>

        {/* Action icons & AI Status */}
        <div className="flex items-center gap-1 sm:gap-4">
          
          {/* AI engine feedback pill */}
          <div className="flex flex-col items-end hidden xl:flex">
            <div className="flex items-center gap-1.5">
              <span className={`text-[9px] font-mono tracking-widest uppercase px-2.5 py-1 font-semibold ${
                browsingCount === 0 
                  ? 'bg-stone-200 text-stone-700' 
                  : 'bg-editorial-ink text-white'
              }`}>
                {status.label}
              </span>
            </div>
            {browsingCount > 0 && (
              <span className="text-[9px] text-editorial-muted mt-0.5 font-mono">
                Learning progress: {status.percentage}%
              </span>
            )}
          </div>

          {/* Removed Mobile Trend, Stylist, Admin icons here since they are in drawer */}

          {/* Mobile Search Toggle Button */}
          <button
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            className="p-1.5 sm:p-2 rounded-none sm:hidden text-stone-600 hover:text-editorial-ink transition-colors touch-target"
            title="Search"
          >
            <Search className="h-5 w-5" />
          </button>

          {/* Wishlist Button */}
          <button
            onClick={onWishlistClick}
            className="p-1.5 sm:p-2 text-stone-600 hover:text-editorial-ink transition-colors touch-target"
            title="Wishlist"
          >
            <span className="relative flex">
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-editorial-accent text-[9px] font-bold text-white">
                  {wishlistCount}
                </span>
              )}
            </span>
          </button>

          {/* Cart Trigger */}
          <button
            onClick={openCart}
            className="p-1.5 sm:p-2 text-stone-600 hover:text-editorial-ink transition-colors touch-target"
            title="Shopping Cart"
          >
            <span className="relative flex">
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 flex h-4 w-4 items-center justify-center rounded-full bg-editorial-ink text-[9px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </span>
          </button>

          {/* User Profile Account Trigger */}
          <button
            onClick={onOpenAuth}
            className="flex items-center gap-1.5 p-1.5 sm:p-2 text-stone-600 hover:text-editorial-ink transition-colors touch-target"
            title={user ? `Atelier Profile (${user.name})` : "Sign In / Register"}
          >
            <User className="h-5 w-5" />
            {user && (
              <span className="hidden xl:inline text-[10px] font-mono uppercase tracking-widest font-semibold text-editorial-ink max-w-[80px] truncate">
                {user.name.split(' ')[0]}
              </span>
            )}
          </button>

        </div>

      </div>

      {isMobileSearchOpen && (
        <div className="sm:hidden border-t border-editorial-line bg-white px-4 py-3 shadow-inner">
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-stone-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search linen, earthy, outerwear..."
              className="w-full rounded-none border border-editorial-line bg-stone-50 py-2 pl-9 pr-4 text-base sm:text-xs text-editorial-ink outline-none"
              autoFocus
            />
          </div>
        </div>
      )}

      </header>

      {/* Mobile Sidebar Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm xl:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed inset-y-0 left-0 z-50 w-[85vw] max-w-[380px] bg-white shadow-xl xl:hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-editorial-line h-16">
                <span className="font-serif italic text-2xl font-bold tracking-tight text-editorial-ink">
                  VOGUE<span className="font-sans not-italic text-xs font-semibold uppercase tracking-widest text-editorial-accent pl-1">.trends</span>
                </span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-stone-500 hover:text-editorial-ink touch-target"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="flex flex-col py-4 overflow-y-auto">
                <button
                  onClick={() => { setActiveTab('shop'); setIsMobileMenuOpen(false); }}
                  className={`flex items-center gap-3 px-6 py-4 text-sm font-semibold tracking-wider uppercase transition-colors ${activeTab === 'shop' ? 'bg-stone-100 text-editorial-ink' : 'text-stone-600'}`}
                >
                  <ShoppingBag className="h-5 w-5" /> Discover Shop
                </button>
                <button
                  onClick={() => { setActiveTab('stylist'); setIsMobileMenuOpen(false); }}
                  className={`flex items-center gap-3 px-6 py-4 text-sm font-semibold tracking-wider uppercase transition-colors ${activeTab === 'stylist' ? 'bg-stone-100 text-editorial-ink' : 'text-stone-600'}`}
                >
                  <Sparkles className="h-5 w-5 text-editorial-accent fill-editorial-accent" /> AI Stylist
                </button>
                <button
                  onClick={() => { setActiveTab('trends'); setIsMobileMenuOpen(false); }}
                  className={`flex items-center gap-3 px-6 py-4 text-sm font-semibold tracking-wider uppercase transition-colors ${activeTab === 'trends' ? 'bg-stone-100 text-editorial-ink' : 'text-stone-600'}`}
                >
                  <TrendingUp className="h-5 w-5" /> Trend Board
                </button>
                {user?.email === 'user' && (
                  <button
                    onClick={() => { setActiveTab('admin'); setIsMobileMenuOpen(false); }}
                    className={`flex items-center gap-3 px-6 py-4 text-sm font-semibold tracking-wider uppercase transition-colors ${activeTab === 'admin' ? 'bg-[#8B4513]/10 text-[#8B4513]' : 'text-[#8B4513]'}`}
                  >
                    <Shield className="h-5 w-5" /> Admin Portal
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
