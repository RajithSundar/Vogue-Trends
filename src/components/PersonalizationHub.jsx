import React, { useState } from 'react';
import { Sparkles, Compass, Shirt, Palette, RefreshCw, ShoppingCart, Check, HelpCircle, Flame, Send, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getApiUrl } from '../utils/api.js';
import { AIResponseTyping } from './ui/AIResponseTyping';

// Helper to format bold text: **bold** -> <strong>
const formatBoldText = (text) => {
  const parts = text.split('**');
  return parts.map((part, index) => {
    if (index % 2 === 1) {
      return <strong key={index} className="font-bold text-editorial-ink">{part}</strong>;
    }
    return part;
  });
};

// Helper to parse basic markdown line-by-line
const parseMarkdown = (text) => {
  if (!text) return '';
  const lines = text.split('\n');
  return lines.map((line, idx) => {
    let trimmed = line.trim();
    
    // Check for lists
    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      const content = trimmed.substring(2);
      return (
        <li key={idx} className="list-disc list-inside ml-2 my-1 text-xs text-stone-600 font-sans leading-relaxed">
          {formatBoldText(content)}
        </li>
      );
    }
    
    // Check for headers
    if (trimmed.startsWith('### ')) {
      return (
        <h5 key={idx} className="text-xs font-bold text-editorial-ink uppercase tracking-wider font-mono mt-3 mb-1">
          {formatBoldText(trimmed.substring(4))}
        </h5>
      );
    }
    if (trimmed.startsWith('## ')) {
      return (
        <h4 key={idx} className="text-sm font-bold text-editorial-ink uppercase tracking-widest font-mono mt-4 mb-2">
          {formatBoldText(trimmed.substring(3))}
        </h4>
      );
    }
    
    // Normal line
    return (
      <p key={idx} className="text-xs text-stone-600 font-sans leading-relaxed my-1.5 min-h-[1px]">
        {formatBoldText(line)}
      </p>
    );
  });
};

export default function PersonalizationHub({
  products,
  browsingHistory,
  onProductClick,
  onAddMultipleToCart,
  initialStylistQuery,
  onClearInitialQuery,
  triggerChatScroll,
}) {
  // Navigation tabs within Hub
  const [hubTab, setHubTab] = useState(initialStylistQuery ? 'chat' : 'capsules');

  // Bespoke Capsules states
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState(null);
  const [error, setError] = useState(null);
  const [addedOutfitId, setAddedOutfitId] = useState(null);

  // Chat Console states
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hello! I am your **Atelier Concierge**, your personal AI fashion consultant. I've analyzed your browsing habits and I am ready to design a custom look. Ask me anything! I can coordinate outfits, explain color matching, or suggest layering strategies.

Here are some ideas to start:
*   *"What tops go well with the Japanese Selvedge Denim?"*
*   *"Design a warm, earth-toned casual outfit"*
*   *"Suggest a minimalist outfit for a cooler autumn workday"*`,
      products: []
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [addedProductId, setAddedProductId] = useState(null);

  // Calculate browsing statistics from history
  const getBrowsingStats = () => {
    const totalViews = browsingHistory.length;
    if (totalViews === 0) return null;

    const categoryCounts = {};
    const styleCounts = {};
    const colorCounts = {};

    browsingHistory.forEach((event) => {
      const p = products.find((prod) => prod.id === event.productId);
      if (!p) return;

      categoryCounts[p.category] = (categoryCounts[p.category] || 0) + 1;
      styleCounts[p.style] = (styleCounts[p.style] || 0) + 1;
      colorCounts[p.color] = colorCounts[p.color] || { count: 0, code: p.colorCode };
      colorCounts[p.color].count += 1;
    });

    const favoriteCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
    const favoriteStyle = Object.entries(styleCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
    const topColors = Object.entries(colorCounts)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 3)
      .map(([name, val]) => ({ name, code: val.code, count: val.count }));

    return {
      totalViews,
      categoryCounts,
      styleCounts,
      favoriteCategory,
      favoriteStyle,
      topColors,
    };
  };

  const stats = getBrowsingStats();

  // Fetch Personalized recommendations from server (Capsules)
  const fetchPersonalization = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(getApiUrl('/api/personalize'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ browsingHistory }),
      });

      if (!response.ok) {
        throw new Error('Stylist server failed to respond. Attempting recovery...');
      }

      const data = await response.json();
      setRecommendations(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred while compiling your stylist dashboard.');
    } finally {
      setLoading(false);
    }
  };

  // Add all items in an outfit to cart at once
  const handleBuyOutfit = (outfitId, itemIds) => {
    const outfitProducts = itemIds
      .map((id) => products.find((p) => p.id === id))
      .filter((p) => !!p);

    if (outfitProducts.length > 0) {
      onAddMultipleToCart(outfitProducts);
      setAddedOutfitId(outfitId);
      setTimeout(() => setAddedOutfitId(null), 3000);
    }
  };

  // Quick helper to add a single product to bag from chat
  const handleBuyProduct = (e, product) => {
    e.stopPropagation();
    onAddMultipleToCart([product]);
    setAddedProductId(product.id);
    setTimeout(() => setAddedProductId(null), 2500);
  };

  // Send a message in the chat
  const handleSendMessage = async (textToSend) => {
    const query = textToSend || inputMessage;
    if (!query.trim() || chatLoading) return;

    const userMsg = { role: 'user', content: query };
    const updatedMessages = [...messages, userMsg];
    
    setMessages(updatedMessages);
    setInputMessage('');
    setChatLoading(true);

    try {
      const response = await fetch(getApiUrl('/api/personalize/chat'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatHistory: updatedMessages,
          browsingHistory
        })
      });

      if (!response.ok) {
        throw new Error('Chat stylist failed to respond.');
      }

      const data = await response.json();
      
      const recommendedProducts = (data.recommendedProductIds || [])
        .map(id => products.find(p => p.id === id))
        .filter(Boolean);

      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: data.message,
          products: recommendedProducts
        }
      ]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: "Forgive me, but my connection to the concierge styling engine was interrupted. Please try again shortly.",
          products: []
        }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  // Handle incoming initial query from the Hero banner
  React.useEffect(() => {
    if (initialStylistQuery) {
      handleSendMessage(initialStylistQuery);
      if (onClearInitialQuery) onClearInitialQuery();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialStylistQuery]);

  // Handle trigger for scrolling to chat
  React.useEffect(() => {
    if (triggerChatScroll > 0) {
      setHubTab('chat');
      // Wait for the route transition and tab switch to render before scrolling
      setTimeout(() => {
        const chatEl = document.getElementById('atelier-chat');
        if (chatEl) {
          chatEl.scrollIntoView({ behavior: 'smooth' });
        }
      }, 150);
    }
  }, [triggerChatScroll]);

  // Loading animation message cycle
  const [loadingStep, setLoadingStep] = useState(0);
  React.useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev + 1) % 4);
    }, 1800);
    return () => clearInterval(interval);
  }, [loading]);

  const loadingMessages = [
    'Analyzing individual browsing patterns & selected favorites...',
    'Matching seasonal palettes with your favorite colors...',
    'Aligning structured outerwear fits with complementary bottoms...',
    'Synthesizing bespoke outfit capsules from Vogue Trends inventory...',
  ];

  const quickPrompts = [
    "Style an earthy layered look",
    "What matches Selvedge Denim?",
    "Suggest corduroy pants outfits",
    "Create a minimal office look"
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="space-y-10 py-4"
    >
      
      {/* Intro Banner */}
      <div className="relative overflow-hidden rounded-none bg-editorial-ink border border-editorial-line p-6 sm:p-10 text-[#F9F8F6] shadow-none">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 opacity-10">
          <Sparkles className="h-96 w-96 text-white stroke-[0.5]" />
        </div>
        <div className="relative max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-1.5 rounded-none bg-editorial-accent px-3 py-1.5 text-[9px] font-mono tracking-widest uppercase text-white">
            <Sparkles className="h-3.5 w-3.5 fill-white" />
            AI-DRIVEN PERSONALIZATION ENGINE
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-normal italic tracking-tight">
            Your Personal AI Stylist
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed font-sans">
            Our stylist doesn't rely on generic trends. It analyzes every category, style vibe, and color hue you browse to dynamically compile custom color theory pairings and bespoke clothing outfits styled specifically for your persona.
          </p>
        </div>
      </div>

      {/* Main section grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Hand: Style Compass (History Statistics) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-none border border-editorial-line bg-white p-6 shadow-none">
            <div className="flex items-center gap-2 border-b border-editorial-line pb-4 mb-4">
              <Compass className="h-4 w-4 text-editorial-ink" />
              <h3 className="font-serif text-xl font-normal text-editorial-ink">
                Style Compass
              </h3>
            </div>

            {!stats ? (
              <div className="text-center py-8 space-y-3">
                <HelpCircle className="mx-auto h-8 w-8 text-stone-400 stroke-[1.5]" />
                <h4 className="text-xs font-bold text-stone-800 font-mono uppercase tracking-wider">Your Compass is Quiet</h4>
                <p className="text-xs text-stone-500 max-w-[240px] mx-auto leading-relaxed">
                  Browse or click clothes in our store catalog, add items to your wishlist or cart, and return here to watch the AI engine learn your preferences!
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Micro metrics */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-none border border-editorial-line bg-[#F9F8F6] p-3 text-center">
                    <span className="text-[10px] text-stone-400 font-mono uppercase tracking-wider block">Catalog Views</span>
                    <p className="text-xl font-normal font-serif text-editorial-ink mt-1">{stats.totalViews}</p>
                  </div>
                  <div className="rounded-none border border-editorial-line bg-[#F9F8F6] p-3 text-center">
                    <span className="text-[10px] text-stone-400 font-mono uppercase tracking-wider block">Profile Strength</span>
                    <p className="text-xl font-normal font-serif text-editorial-ink mt-1">
                      {Math.min(40 + stats.totalViews * 10, 100)}%
                    </p>
                  </div>
                </div>

                {/* Favorite Style */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest font-mono flex items-center gap-1">
                    <Shirt className="h-3.5 w-3.5" /> Preferred Style Vibe
                  </span>
                  <div className="rounded-none border border-editorial-line bg-[#F9F8F6] p-4">
                    <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider">
                      <span className="font-bold text-editorial-ink">{stats.favoriteStyle}</span>
                      <span className="text-stone-500 font-semibold">
                        {stats.styleCounts[stats.favoriteStyle]} views
                      </span>
                    </div>
                    {/* Style meters */}
                    <div className="mt-3 space-y-2 text-xs">
                      {Object.entries(stats.styleCounts).map(([styleName, count]) => {
                        const pct = Math.round((count / stats.totalViews) * 100);
                        return (
                          <div key={styleName} className="space-y-1">
                            <div className="flex justify-between text-[10px] text-stone-600 font-mono uppercase">
                              <span>{styleName}</span>
                              <span className="font-bold">{pct}%</span>
                            </div>
                            <div className="h-1.5 w-full rounded-none bg-stone-200 overflow-hidden">
                              <div
                                  className="h-full bg-editorial-accent rounded-none"
                                  style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Favorite Colors */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest font-mono flex items-center gap-1">
                    <Palette className="h-3.5 w-3.5" /> Palette Interests
                  </span>
                  <div className="rounded-none border border-editorial-line bg-[#F9F8F6] p-4">
                    <div className="flex flex-wrap gap-3">
                      {stats.topColors.map((col) => (
                        <div key={col.name} className="flex items-center gap-2">
                          <div
                            className="h-4.5 w-4.5 rounded-full border border-stone-300"
                            style={{ backgroundColor: col.code }}
                          />
                          <div className="text-[10px]">
                            <p className="font-mono uppercase font-bold text-editorial-ink leading-none">{col.name}</p>
                            <span className="text-[9px] text-stone-400 font-mono">
                              {col.count} view{col.count > 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Favorite Categories */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest font-mono block">
                    Category Distribution
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(stats.categoryCounts).map(([cat, count]) => (
                      <span
                        key={cat}
                        className="rounded-none border border-editorial-line bg-white px-2.5 py-0.5 text-[9px] font-mono uppercase text-stone-700"
                      >
                        {cat} ({count})
                      </span>
                    ))}
                  </div>
                </div>

                {/* Learning Notice */}
                <p className="text-[9px] text-stone-400 leading-normal text-center bg-[#F9F8F6] border border-editorial-line p-2.5 font-mono uppercase tracking-wider">
                  The compass matches and recalculates on every browse event. Click catalog items to shift your vibe!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Hand: Sub-tabs and results */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-none border border-editorial-line bg-white p-6 shadow-none flex flex-col h-full">
            
            {/* Header controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-editorial-line pb-4 mb-4">
              <div>
                <h3 className="font-serif text-2xl font-normal text-editorial-ink">
                  Atelier AI Stylist
                </h3>
                <p className="text-xs text-editorial-muted mt-0.5 font-sans">
                  Choose between compiled outfit capsules or real-time personal stylist chat
                </p>
              </div>
            </div>

            {/* Custom Navigation Tab Rails */}
            <div className="flex border-b border-editorial-line mb-6">
              <button
                onClick={() => setHubTab('capsules')}
                className={`flex-1 pb-3 text-xs font-mono uppercase tracking-widest font-bold border-b-2 transition-all ${
                  hubTab === 'capsules'
                    ? 'border-editorial-ink text-editorial-ink'
                    : 'border-transparent text-stone-400 hover:text-editorial-ink'
                }`}
              >
                Bespoke Capsules
              </button>
              <button
                onClick={() => setHubTab('chat')}
                className={`flex-1 pb-3 text-xs font-mono uppercase tracking-widest font-bold border-b-2 transition-all ${
                  hubTab === 'chat'
                    ? 'border-editorial-ink text-editorial-ink'
                    : 'border-transparent text-stone-400 hover:text-editorial-ink'
                }`}
              >
                Atelier Chat
              </button>
            </div>

            {/* TAB CONTENT: BESPOKE CAPSULES */}
            {hubTab === 'capsules' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-[#F9F8F6] p-4 border border-editorial-line">
                  <span className="text-xs text-stone-600 font-sans">Generate 3 custom outfits matching your exact style history.</span>
                  <button
                    onClick={fetchPersonalization}
                    disabled={loading}
                    className="inline-flex items-center gap-2 rounded-none bg-editorial-ink px-4 py-2.5 text-[10px] font-mono uppercase tracking-widest font-bold text-white hover:bg-editorial-accent transition-colors disabled:bg-stone-300"
                  >
                    <Sparkles className="h-3.5 w-3.5 text-white fill-white" />
                    {recommendations ? 'Re-Formulate Capsules' : 'Formulate Outfits'}
                  </button>
                </div>

                {/* ERROR HANDLING */}
                {error && (
                  <div className="rounded-none bg-red-50 border border-red-200 p-4 text-sm text-red-800 font-mono">
                    <p className="font-semibold uppercase tracking-wider text-xs">Styling Engine Alert</p>
                    <p className="mt-1 text-xs text-red-700 font-sans">{error}</p>
                    <button
                      onClick={fetchPersonalization}
                      className="mt-3 text-xs font-bold text-red-900 hover:underline flex items-center gap-1 uppercase tracking-widest font-mono"
                    >
                      <RefreshCw className="h-3 w-3 animate-spin" /> Try Again
                    </button>
                  </div>
                )}

                {/* LOADING */}
                <AnimatePresence mode="wait">
                  {loading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="flex flex-col items-center justify-center py-20 text-center space-y-4"
                    >
                      <div className="relative">
                        <div className="h-16 w-16 animate-spin rounded-none border-2 border-stone-200 border-t-editorial-ink" />
                        <Sparkles className="absolute top-1/2 left-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 text-editorial-accent animate-pulse" />
                      </div>
                      <div className="space-y-1.5 max-w-sm">
                        <h4 className="text-xs font-bold text-editorial-ink font-mono uppercase tracking-widest">Styling Engine Drafting...</h4>
                        <p className="text-xs text-stone-500 min-h-[40px] leading-relaxed">
                          {loadingMessages[loadingStep]}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* INITIAL CAPSULES DRAFT VIEW */}
                {!loading && !recommendations && !error && (
                  <div className="text-center py-16 space-y-4 border border-dashed border-editorial-line">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-none bg-[#F9F8F6] border border-editorial-line text-editorial-accent">
                      <Sparkles className="h-7 w-7 text-editorial-accent stroke-[1.5]" />
                    </div>
                    <div className="space-y-1.5 max-w-md mx-auto">
                      <h4 className="font-serif text-xl font-normal text-editorial-ink">
                        Capsules Ready for Formulation
                      </h4>
                      <p className="text-xs text-stone-500 leading-relaxed font-sans">
                        Press the button above to assemble three unique outfit combinations compiled specifically from your current style profile.
                      </p>
                    </div>
                  </div>
                )}

                {/* CAPSULE RECOMMENDATIONS RESULTS */}
                {!loading && recommendations && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-8"
                  >
                    {/* Style Profiles */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="rounded-none border border-editorial-line bg-[#F9F8F6] p-5 space-y-3">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-stone-400 tracking-widest uppercase font-mono">
                          <Sparkles className="h-4 w-4 text-editorial-accent fill-editorial-accent" /> Your Style Profile
                        </div>
                        <div>
                          <h4 className="font-serif text-xl font-normal italic text-editorial-ink">
                            {recommendations.styleProfileName}
                          </h4>
                          <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                            {recommendations.styleProfileDescription}
                          </p>
                        </div>
                      </div>

                      <div className="rounded-none border border-editorial-line bg-[#F9F8F6] p-5 space-y-3">
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-stone-400 tracking-widest uppercase font-mono">
                          <Palette className="h-4 w-4 text-editorial-accent" /> Color Harmony
                        </div>
                        <div>
                          <h4 className="font-mono text-xs font-bold text-editorial-ink uppercase tracking-wider">
                            Color Coordination Analysis
                          </h4>
                          <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                            {recommendations.colorAnalysis}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Outfits List */}
                    <div className="space-y-6">
                      {recommendations.outfits.map((outfit) => (
                        <div
                          key={outfit.id}
                          className="rounded-none border border-editorial-line bg-white overflow-hidden shadow-none hover:border-editorial-ink transition-colors duration-300"
                        >
                          <div className="bg-[#F9F8F6] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-editorial-line">
                            <div>
                              <h5 className="font-serif text-xl font-normal italic text-editorial-ink">
                                {outfit.name}
                              </h5>
                              <p className="text-xs text-stone-500 mt-0.5">{outfit.description}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="flex flex-col items-end">
                                <span className="text-[9px] text-stone-400 uppercase font-mono">Match Score</span>
                                <span className="text-xs font-bold text-editorial-accent font-mono">
                                  {outfit.suitabilityScore}%
                                </span>
                              </div>
                              <button
                                onClick={() => handleBuyOutfit(outfit.id, outfit.items.map(i => i.productId))}
                                className="inline-flex items-center gap-1.5 rounded-none bg-editorial-ink px-3.5 py-2 text-[10px] font-mono uppercase tracking-widest font-bold text-white shadow-none hover:bg-editorial-accent transition-colors"
                              >
                                {addedOutfitId === outfit.id ? (
                                  <>
                                    <Check className="h-3.5 w-3.5 text-[#D2B48C]" />
                                    Bagged!
                                  </>
                                ) : (
                                  <>
                                    <ShoppingCart className="h-3.5 w-3.5" />
                                    Buy Look
                                  </>
                                )}
                              </button>
                            </div>
                          </div>

                          <div className="px-4 py-2 bg-[#F9F8F6]/40 border-b border-editorial-line text-[11px] text-stone-600 font-serif italic">
                            <strong>Color Strategy: </strong> {outfit.colorComboExplanation}
                          </div>

                          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {outfit.items.map((item) => {
                              const p = products.find((prod) => prod.id === item.productId);
                              if (!p) return null;

                              return (
                                <div
                                  key={p.id}
                                  onClick={() => onProductClick(p)}
                                  className="group/item flex gap-3 p-2.5 rounded-none border border-editorial-line hover:border-editorial-ink bg-[#F9F8F6]/30 hover:bg-white transition-colors cursor-pointer"
                                >
                                  <div className="h-16 w-16 rounded-none overflow-hidden shrink-0 bg-stone-100 border border-editorial-line">
                                    <img
                                      src={p.imageUrl}
                                      alt={p.name}
                                      referrerPolicy="no-referrer"
                                      className="h-full w-full object-cover transition-transform duration-500 group-hover/item:scale-105"
                                    />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start gap-1">
                                      <p className="text-xs font-bold text-editorial-ink truncate group-hover/item:text-[#8B4513] font-mono uppercase tracking-wider">
                                        {p.name}
                                      </p>
                                      <span className="text-xs font-bold text-editorial-accent font-mono">${p.price}</span>
                                    </div>
                                    <span className="inline-block mt-0.5 rounded-none border border-editorial-line bg-white px-1.5 py-0.5 text-[8px] font-mono font-medium text-[#8B4513] uppercase tracking-wider">
                                      {item.role}
                                    </span>
                                    <p className="text-[10px] text-stone-500 leading-tight mt-1.5 line-clamp-2">
                                      {item.reason}
                                    </p>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            )}

            {/* TAB CONTENT: ATELIER INTERACTIVE CHAT */}
            {hubTab === 'chat' && (
              <motion.div 
                id="atelier-chat" 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut", delay: 0.2 }}
                className="flex flex-col h-[500px] border border-editorial-line bg-[#F9F8F6]/30 scroll-mt-32"
              >
                
                {/* Message Log */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((msg, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut", delay: idx === 0 ? 0.35 : 0 }}
                      className={`flex flex-col max-w-[85%] ${
                        msg.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                      }`}
                    >
                      <div
                        className={msg.role === 'user'
                            ? 'bg-editorial-ink text-white p-3.5 text-xs leading-relaxed shadow-sm font-sans'
                            : 'w-full'
                        }
                      >
                        {msg.role === 'assistant' ? (
                          <AIResponseTyping
                             text={msg.content}
                             thinkingState={idx === messages.length - 1 ? "typing" : "idle"}
                             speed={20}
                          />
                        ) : (
                          <p>{msg.content}</p>
                        )}
                      </div>

                      {/* Display inline recommended products */}
                      {msg.role === 'assistant' && msg.products && msg.products.length > 0 && (
                        <div className="w-full mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                          {msg.products.map((p) => (
                            <div
                              key={p.id}
                              onClick={() => onProductClick(p)}
                              className="group/chat-item flex items-center gap-3 p-2 bg-white border border-editorial-line hover:border-editorial-ink transition-colors cursor-pointer"
                            >
                              <div className="h-14 w-14 rounded-none overflow-hidden shrink-0 bg-stone-100 border border-editorial-line">
                                <img
                                  src={p.imageUrl}
                                  alt={p.name}
                                  referrerPolicy="no-referrer"
                                  className="h-full w-full object-cover transition-transform duration-500 group-hover/chat-item:scale-105"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-bold text-editorial-ink truncate group-hover/chat-item:text-editorial-accent font-mono uppercase tracking-wider">
                                  {p.name}
                                </p>
                                <p className="text-[9px] text-stone-500 font-mono mt-0.5">
                                  {p.category} | ${p.price}
                                </p>
                                <button
                                  onClick={(e) => handleBuyProduct(e, p)}
                                  className="text-[9px] font-bold text-editorial-accent hover:text-editorial-ink mt-1.5 block uppercase tracking-widest font-mono"
                                >
                                  {addedProductId === p.id ? 'Added!' : 'Add to Bag'}
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  ))}

                  {/* LOADING STATE USING AIResponseTyping */}
                  {chatLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col max-w-[85%] mr-auto items-start"
                    >
                      <AIResponseTyping thinkingState="thinking" />
                    </motion.div>
                  )}
                </div>

                {/* Quick prompts buttons bar */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut", delay: 0.5 }}
                  className="px-4 py-2 border-t border-editorial-line bg-[#F9F8F6] flex gap-2 overflow-x-auto shrink-0 scrollbar-none"
                >
                  {quickPrompts.map((promptText, pIdx) => (
                    <button
                      key={pIdx}
                      onClick={() => handleSendMessage(promptText)}
                      className="text-[9px] font-mono uppercase tracking-wider font-semibold border border-editorial-line bg-white hover:border-editorial-ink px-3 py-1.5 whitespace-nowrap transition-colors"
                    >
                      {promptText}
                    </button>
                  ))}
                </motion.div>

                {/* Input Area */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut", delay: 0.65 }}
                  className="p-3 border-t border-editorial-line bg-white flex gap-2 items-center shrink-0"
                >
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Consult your stylist concierge (e.g. 'Help me style a beige linen look')..."
                    className="flex-1 bg-stone-50 border border-editorial-line px-3 py-2 text-xs text-editorial-ink outline-none transition-all focus:border-editorial-ink"
                    disabled={chatLoading}
                  />
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={chatLoading || !inputMessage.trim()}
                    className="bg-editorial-ink hover:bg-editorial-accent disabled:bg-stone-300 text-white p-2.5 transition-colors"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </motion.div>

              </motion.div>
            )}

          </div>
        </div>

      </div>

    </motion.div>
  );
}
