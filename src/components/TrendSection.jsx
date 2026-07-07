import React from 'react';
import { ArrowRight, Palette, Globe } from 'lucide-react';
import { motion } from 'motion/react';

const TRENDS = [
  {
    id: 'trend-1',
    name: 'Quiet Earthy Luxury',
    tagline: 'Refined minimalism with soft organically dyed fabrics',
    description: 'Earthy luxury embraces heavyweight cotton, breathable linen, and open jackets. Characterized by calming sage, sand beige, and rich olive colors that ground your daily look in comfort.',
    vibe: 'Minimalist',
    colors: [
      { name: 'Sage Green', hex: '#87a987' },
      { name: 'Sand Beige', hex: '#decb9c' },
      { name: 'Olive Green', hex: '#3f6212' },
      { name: 'Pure White', hex: '#ffffff' }
    ],
    highlightImageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'trend-2',
    name: 'Monochromatic Techwear',
    tagline: 'Sleek urban ergonomics tailored for unpredictable climates',
    description: 'A merging of athletic flexibility and tactical utility. Features loopback hoodies, waterproof ripstop windbreakers, technical cargo pockets, and deep obsidian-grade dark tones.',
    vibe: 'Streetwear',
    colors: [
      { name: 'Midnight Black', hex: '#111827' },
      { name: 'Slate Gray', hex: '#6b7280' },
      { name: 'Teal Blue', hex: '#0f766e' },
      { name: 'Indigo Blue', hex: '#1e3a8a' }
    ],
    highlightImageUrl: 'https://images.unsplash.com/photo-1517462964-21fdcec3f25b?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'trend-3',
    name: 'Suede Retro Nostalgia',
    tagline: 'A revival of 1970s silhouettes with textured grain linings',
    description: 'Nostalgic collegiate aesthetics are making a massive comeback. Highlighting rich split-cow suede bombers, raw selvedge indigo denims, and oatmeal low-profile trainers.',
    vibe: 'Bohemian',
    colors: [
      { name: 'Honey Gold', hex: '#cca43b' },
      { name: 'Indigo Blue', hex: '#2563eb' },
      { name: 'Oats & Cream', hex: '#eae5d9' },
      { name: 'Espresso Brown', hex: '#3c2a21' }
    ],
    highlightImageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80'
  }
];

export default function TrendSection({ onSelectTrendStyle, setActiveTab }) {
  
  const handleBrowseTrend = (trend) => {
    onSelectTrendStyle(trend);
  };

  return (
    <div className="space-y-10 py-4">
      {/* Editorial Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 rounded-none bg-editorial-ink px-3.5 py-1.5 text-[9px] font-bold tracking-widest text-white uppercase font-mono">
          <Globe className="h-3.5 w-3.5 text-stone-300" />
          GLOBAL RETAIL FORECAST
        </div>
        <h2 className="font-serif text-3xl font-normal tracking-tight text-editorial-ink sm:text-5xl">
          Season Trends & Color Theory
        </h2>
        <p className="text-xs text-editorial-muted leading-relaxed font-sans">
          Deep structural studies into contemporary silhouettes, texture weights, and tonal balances dominating Paris, Tokyo, and Milan collections. Click any trend to discover coordinating ranges.
        </p>
      </div>

      {/* Grid of Editorial trends */}
      <div className="space-y-12">
        {TRENDS.map((trend, idx) => {
          const isEven = idx % 2 === 0;
          return (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              key={trend.id}
              onClick={() => handleBrowseTrend(trend)}
              className={`flex flex-col xl:flex-row gap-8 items-center bg-[#F9F8F6] p-6 sm:p-8 rounded-none border border-editorial-line hover:bg-white transition-colors duration-300 cursor-pointer ${
                isEven ? 'xl:flex-row' : 'xl:flex-row-reverse'
              }`}
            >
              {/* Image highlight */}
              <div className="w-full xl:w-1/2 aspect-[16/10] sm:aspect-[16/9] xl:aspect-[4/3] rounded-none overflow-hidden bg-stone-100 border border-editorial-line">
                <img
                  src={trend.highlightImageUrl}
                  alt={trend.name}
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>

              {/* Trend details */}
              <div className="w-full xl:w-1/2 space-y-5">
                <div className="space-y-1.5">
                  <span className="text-[9px] uppercase font-mono font-bold tracking-wider text-editorial-accent bg-[#8B4513]/10 rounded-none px-2.5 py-1 inline-block">
                    Trend #{idx + 1} • {trend.vibe} Style
                  </span>
                  <h3 className="font-serif text-3xl font-normal italic text-editorial-ink leading-tight">
                    {trend.name}
                  </h3>
                  <p className="text-xs font-serif font-medium text-stone-500 italic">
                    "{trend.tagline}"
                  </p>
                </div>

                <p className="text-xs text-stone-600 leading-relaxed font-sans">
                  {trend.description}
                </p>

                {/* Palette Swatches */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-stone-400 uppercase tracking-widest font-mono">
                    <Palette className="h-3.5 w-3.5" /> Palette Swatches
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {trend.colors.map((color) => (
                      <div key={color.name} className="flex items-center gap-1.5 bg-white rounded-none p-1.5 pr-2.5 border border-editorial-line">
                        <div
                          className="h-4 w-4 rounded-full border border-stone-300"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="text-[10px] font-mono font-medium text-stone-700">{color.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Call to action */}
                <div className="pt-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleBrowseTrend(trend); }}
                    className="inline-flex items-center justify-center gap-2 rounded-none bg-editorial-ink px-5 py-3 min-h-[44px] text-xs font-bold tracking-widest uppercase text-white hover:bg-editorial-accent transition-colors"
                  >
                    Browse Coordinated Range
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

    </div>
  );
}
