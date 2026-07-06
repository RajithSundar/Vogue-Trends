import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Lock, Sparkles, CheckCircle2 } from "lucide-react";
import ProductCard from "./ProductCard";

export default function CollectionTab({
  activeTag,
  products,
  user,
  token,
  onProductClick,
  setIsAuthOpen,
  setUser,
  wishlist = [],
  toggleWishlist = () => {},
  preferredStyle = null,
}) {
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [error, setError] = useState("");
  const [collectionProducts, setCollectionProducts] = useState([]);
  const [isLoadingCollection, setIsLoadingCollection] = useState(false);

  useEffect(() => {
    const loadTaggedProducts = async () => {
      if (!activeTag) {
        setCollectionProducts([]);
        return;
      }

      const decodedTag = decodeURIComponent(activeTag);
      const requestUrl = `/api/products/tag/${encodeURIComponent(decodedTag)}`;

      console.log("[CollectionTab] activeTag before fetch:", decodedTag);
      console.log("[CollectionTab] fetch URL:", requestUrl);

      setIsLoadingCollection(true);

      try {
        const res = await fetch(requestUrl);
        const data = await res.json();

        console.log("[CollectionTab] backend response:", {
          status: res.status,
          ok: res.ok,
          data,
        });

        const nextProducts = Array.isArray(data) ? data : [];
        setCollectionProducts(nextProducts);
        console.log(
          "[CollectionTab] collectionProducts state updated:",
          nextProducts,
        );
      } catch (fetchError) {
        console.error(
          "[CollectionTab] failed to fetch tagged products:",
          fetchError,
        );
        setCollectionProducts([]);
      } finally {
        setIsLoadingCollection(false);
      }
    };

    loadTaggedProducts();
  }, [activeTag]);

  const handleSubscribe = async () => {
    setIsSubscribing(true);
    setError("");
    try {
      const res = await fetch("/api/auth/subscribe", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
      } else {
        setError(data.message || "Subscription failed");
      }
    } catch (err) {
      setError("Network error");
    } finally {
      setIsSubscribing(false);
    }
  };

  const renderContent = () => {
    if (activeTag === "Members Only") {
      if (!user) {
        return (
          <div className="flex flex-col items-center justify-center min-h-[500px] text-center max-w-lg mx-auto">
            <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mb-6">
              <Lock className="w-8 h-8 text-stone-400" />
            </div>
            <h2 className="font-serif text-3xl font-bold mb-4">
              Members Only Collection
            </h2>
            <p className="text-stone-500 mb-8">
              This highly curated collection is reserved exclusively for VOGUE
              Insiders. Sign in to view and unlock these pieces.
            </p>
            <button
              onClick={() => setIsAuthOpen(true)}
              className="bg-editorial-ink text-white px-8 py-3 rounded-full hover:bg-stone-800 transition-colors"
            >
              Sign In to Access
            </button>
          </div>
        );
      }

      if (!user.isMember) {
        return (
          <div className="flex flex-col items-center justify-center min-h-[500px] text-center max-w-lg mx-auto">
            <div className="w-16 h-16 bg-amber-50 rounded-full flex items-center justify-center mb-6">
              <Sparkles className="w-8 h-8 text-amber-500" />
            </div>
            <h2 className="font-serif text-3xl font-bold mb-4">
              Become a VOGUE Insider
            </h2>
            <p className="text-stone-500 mb-8">
              Unlock the Members Only collection, gain early access to drops,
              and receive bespoke styling advice for just{" "}
              <strong>$9.99/mo</strong>.
            </p>

            <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm w-full mb-8 text-left space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span>Access exclusive archive pieces</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span>Unlimited AI Stylist sessions</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span>Free priority shipping</span>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            <button
              onClick={handleSubscribe}
              disabled={isSubscribing}
              className="bg-editorial-ink text-white px-8 py-3 rounded-full hover:bg-stone-800 transition-colors disabled:opacity-50 w-full"
            >
              {isSubscribing
                ? "Processing Payment..."
                : "Subscribe Now - $9.99/mo"}
            </button>
          </div>
        );
      }
    }

    // User is allowed to see the collection
    if (collectionProducts.length === 0) {
      if (isLoadingCollection) {
        return (
          <div className="text-center py-20 text-stone-500">
            Loading collection...
          </div>
        );
      }

      return (
        <div className="text-center py-20 text-stone-500">
          No products found for this collection yet.
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 gap-y-12 pb-24">
        {collectionProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onViewDetails={onProductClick}
            isWishlisted={wishlist.includes(product.id)}
            toggleWishlist={toggleWishlist}
            preferredStyle={preferredStyle}
          />
        ))}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-7xl mx-auto px-4 md:px-8 mt-12 mb-32"
    >
      <div className="text-center mb-16">
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-editorial-ink tracking-tight mb-4">
          {activeTag}
        </h1>
        <p className="text-stone-500 max-w-xl mx-auto">
          {activeTag === "Summer Sale" &&
            "Enjoy 50% off our most coveted warm-weather staples."}
          {activeTag === "New Arrivals" &&
            "Discover the latest silhouettes fresh off the runway."}
          {activeTag === "Members Only" &&
            "The archive vault. Exclusively curated for VOGUE Insiders."}
        </p>
      </div>

      {renderContent()}
    </motion.div>
  );
}
