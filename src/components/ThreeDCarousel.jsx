import React, { useRef, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

// Simplified inline Card components to avoid external dependencies
const Card = ({ className, children, ...props }) => (
  <div className={`rounded-lg bg-white/70 backdrop-blur-md border border-editorial-line shadow-sm ${className || ''}`} {...props}>
    {children}
  </div>
);

const CardContent = ({ className, children, ...props }) => (
  <div className={`p-6 pt-0 ${className || ''}`} {...props}>
    {children}
  </div>
);

const ThreeDCarousel = ({
  items = [],
  autoRotate = true,
  rotateInterval = 4000,
  cardHeight = 500,
  title = "Trending Now",
  subtitle = "Editor's Picks",
  tagline = "Explore the cutting edge of fashion.",
  onExplore = () => {}
}) => {
  const [active, setActive] = useState(0);
  const carouselRef = useRef(null);
  const [isInView, setIsInView] = useState(true);
  const [isHovering, setIsHovering] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const minSwipeDistance = 50;

  // We can just rely on standard window width for mobile check
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    if (autoRotate && isInView && !isHovering) {
      const interval = setInterval(() => {
        setActive((prev) => (prev + 1) % items.length);
      }, rotateInterval);
      return () => clearInterval(interval);
    }
  }, [isInView, isHovering, autoRotate, rotateInterval, items.length]);

  const onTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
    setTouchEnd(null);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) {
      setActive((prev) => (prev + 1) % items.length);
    } else if (distance < -minSwipeDistance) {
      setActive((prev) => (prev - 1 + items.length) % items.length);
    }
  };

  const getCardAnimationClass = (index) => {
    if (index === active) return "scale-100 opacity-100 z-20";
    if (index === (active + 1) % items.length)
      return "translate-x-[40%] scale-95 opacity-60 z-10";
    if (index === (active - 1 + items.length) % items.length)
      return "translate-x-[-40%] scale-95 opacity-60 z-10";
    return "scale-90 opacity-0 z-0 hidden pointer-events-none";
  };

  if (!items || items.length === 0) return null;

  return (
    <section className="bg-editorial-bg min-w-full flex items-center justify-center py-20 px-4">
      <div className="w-full max-w-7xl mx-auto flex flex-col items-center">
        <div className="text-center mb-12">
          <h2 className="text-xs font-mono font-bold tracking-widest uppercase text-editorial-accent mb-4">{subtitle}</h2>
          <h1 className="text-4xl md:text-5xl font-serif text-editorial-ink mb-4">{title}</h1>
          <p className="text-editorial-text max-w-2xl mx-auto">{tagline}</p>
        </div>

        <div
          className="relative w-full overflow-hidden"
          style={{ height: cardHeight }}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          ref={carouselRef}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            {items.map((item, index) => (
              <div
                key={item.id}
                className={`absolute w-full max-w-md transform transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] ${getCardAnimationClass(
                  index
                )}`}
              >
                <Card className="overflow-hidden flex flex-col shadow-xl" style={{ height: cardHeight * 0.9 }}>
                  <div
                    className="relative bg-stone-900 h-3/5 overflow-hidden flex flex-col justify-end p-6"
                  >
                    <img src={item.imageUrl} alt={item.title} className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-1000 hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none" />
                    <div className="relative z-10">
                      <h3 className="text-2xl font-serif text-white mb-2 leading-tight drop-shadow-md">
                        {item.brand.toUpperCase()}
                      </h3>
                      <div className="w-12 h-1 bg-white mb-2" />
                    </div>
                  </div>

                  <CardContent className="p-6 flex flex-col flex-grow bg-white">
                    <h3 className="text-xl font-bold mb-1 text-editorial-ink font-serif">
                      {item.title}
                    </h3>
                    <p className="text-editorial-text text-sm font-medium mb-4 uppercase tracking-wider">
                      {item.brand}
                    </p>
                    <p className="text-editorial-text text-sm flex-grow leading-relaxed">
                      {item.description}
                    </p>

                    <div className="mt-4 pt-4 border-t border-editorial-line">
                      <div className="flex flex-wrap gap-2 mb-4">
                        {item.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-editorial-bg text-editorial-ink font-mono rounded-none border border-editorial-line text-xs uppercase"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <a
                        href={item.link}
                        className="text-editorial-ink font-mono text-xs uppercase tracking-widest font-bold flex items-center hover:text-editorial-accent transition-colors group cursor-pointer"
                        onClick={(e) => {
                          e.preventDefault();
                          onExplore(item);
                        }}
                      >
                        Explore Collection
                        <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>

          {!isMobile && items.length > 1 && (
            <>
              <button
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-editorial-ink hover:bg-editorial-ink hover:text-white z-30 shadow-lg transition-all"
                onClick={() =>
                  setActive((prev) => (prev - 1 + items.length) % items.length)
                }
                aria-label="Previous"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-editorial-ink hover:bg-editorial-ink hover:text-white z-30 shadow-lg transition-all"
                onClick={() => setActive((prev) => (prev + 1) % items.length)}
                aria-label="Next"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          <div className="absolute bottom-0 left-0 right-0 flex justify-center items-center space-x-3 z-30">
            {items.map((_, idx) => (
              <button
                key={idx}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  active === idx
                    ? "bg-editorial-ink w-6"
                    : "bg-editorial-line hover:bg-editorial-text"
                }`}
                onClick={() => setActive(idx)}
                aria-label={`Go to item ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ThreeDCarousel;
