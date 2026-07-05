import React from 'react';
import { Heart, Star, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export default function ProductCard({
  product,
  onViewDetails,
  isWishlisted,
  toggleWishlist,
  preferredStyle,
}) {
  const isStyleMatch = preferredStyle === product.style;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="group relative flex flex-col overflow-hidden rounded-none border border-editorial-line bg-editorial-bg transition-colors duration-300 hover:bg-white hover:shadow-xs"
    >
      {/* Product Image and badges */}
      <div 
        className="relative aspect-[4/5] overflow-hidden bg-stone-100 border-b border-editorial-line cursor-pointer"
        onClick={() => onViewDetails(product)}
      >
        <img
          src={product.imageUrl}
          alt={product.name}
          referrerPolicy="no-referrer"
          loading="lazy"
          className="h-full w-full object-cover object-center transition-transform duration-700 group-hover:scale-105"
        />

        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

        {/* Floating Heart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product.id);
          }}
          className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center rounded-none bg-white border border-editorial-line transition-colors hover:bg-editorial-bg text-stone-700 before:absolute before:-inset-3 before:content-['']"
        >
          <Heart
            className={`h-3.5 w-3.5 transition-all ${
              isWishlisted ? 'fill-editorial-accent stroke-editorial-accent scale-110' : 'stroke-stone-600 hover:stroke-editorial-accent'
            }`}
          />
        </button>

        {/* Personalized Style Match Indicator */}
        {isStyleMatch && (
          <div className="absolute top-3 left-3 z-10 flex items-center gap-1 rounded-none bg-editorial-ink px-2.5 py-1 text-[9px] font-semibold tracking-wider uppercase text-white shadow-xs">
            <Sparkles className="h-3 w-3 text-amber-400 fill-amber-400" />
            Style Match
          </div>
        )}

        {/* General Category Label */}
        <div className="absolute bottom-3 left-3 z-10 rounded-none bg-white border border-editorial-line px-2 py-0.5 text-[9px] font-mono uppercase tracking-widest text-editorial-ink">
          {product.category}
        </div>
      </div>

      {/* Product Information */}
      <div className="flex flex-1 flex-col p-2 sm:p-4 bg-transparent">
        <div className="flex items-center justify-between gap-1 mb-1">
          {/* Style Vibe */}
          <span className="text-[10px] font-mono text-editorial-muted tracking-wider uppercase">
            {product.style}
          </span>
          {/* Stars */}
          <div className="flex items-center gap-1 text-[11px] text-stone-600 font-mono">
            <Star className="h-3 w-3 fill-amber-400 stroke-amber-400" />
            <span>{product.rating}</span>
          </div>
        </div>

        {/* Product Name */}
        <h3 
          className="font-serif text-sm sm:text-lg font-normal text-editorial-ink group-hover:text-editorial-accent transition-colors line-clamp-1 cursor-pointer"
          onClick={() => onViewDetails(product)}
        >
          {product.name}
        </h3>

        {/* Color and swatches */}
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <div
              className="h-3.5 w-3.5 rounded-full border border-editorial-line shadow-xs"
              style={{ backgroundColor: product.colorCode }}
              title={product.color}
            />
            <span className="text-xs text-stone-500 truncate max-w-[100px]">{product.color}</span>
          </div>
          {/* Price */}
          <span className="font-serif text-sm sm:text-base font-bold text-editorial-accent">
            ${product.price}.00
          </span>
        </div>

        {/* Tags brief */}
        <div className="mt-2.5 hidden sm:flex flex-wrap gap-1">
          {product.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="border border-editorial-line bg-white/50 px-2 py-0.5 text-[9px] text-stone-600 font-mono"
            >
              #{tag}
            </span>
          ))}
        </div>

      </div>
    </motion.div>
  );
}
