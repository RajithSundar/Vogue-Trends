import React, { useRef, useEffect, useState } from "react";
import { motion, useAnimationFrame, useInView } from "framer-motion";

const ImageMarquee = ({
  items = [],
  speed = 40, // pixels per second
  direction = "left",
  imageWidth = "w-[120px] sm:w-[150px] md:w-[180px]",
  imageHeight = "h-[60px] sm:h-[80px] md:h-[100px]",
  imageMarginX = "mx-4 sm:mx-8 md:mx-12",
}) => {
  const containerRef = useRef(null);
  const x = useRef(0);
  const [isHovered, setIsHovered] = useState(false);
  const isInView = useInView(containerRef, { margin: "20%" });

  useEffect(() => {
    if (containerRef.current) {
      const initialScrollWidth = containerRef.current.scrollWidth;
      if (initialScrollWidth > 0) {
        const singleSetWidth = initialScrollWidth / 2;
        if (direction === "right") {
          x.current = -singleSetWidth;
        } else {
          x.current = 0;
        }
        containerRef.current.style.transform = `translateX(${x.current}px)`;
      }
    }
  }, [direction, items]);

  useAnimationFrame((t, delta) => {
    if (!isInView || isHovered) return;

    if (containerRef.current) {
      const fullContentWidth = containerRef.current.scrollWidth;
      if (fullContentWidth === 0) return;

      const singleSetWidth = fullContentWidth / 2;
      const moveBy = (speed * delta) / 1000;

      if (direction === "left") {
        x.current -= moveBy;
        if (x.current <= -singleSetWidth) {
          x.current = 0;
        }
      } else {
        x.current += moveBy;
        if (x.current >= 0) {
          x.current = -singleSetWidth;
        }
      }

      containerRef.current.style.transform = `translateX(${x.current}px)`;
    }
  });

  if (!items || items.length === 0) return null;

  const allItems = [...items, ...items];

  return (
    <section className="w-full relative py-8 border-y border-editorial-line bg-white overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
      
      <div
        className="w-full relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          ref={containerRef}
          className="flex w-max items-center"
          style={{ willChange: "transform" }}
        >
          {allItems.map((item, idx) => (
            <a
              key={`${item.id}-${idx}`}
              href={item.link}
              className={`${imageWidth} ${imageHeight} ${imageMarginX} flex-shrink-0 
              transform hover:scale-110 transition-all duration-300 opacity-60 hover:opacity-100 grayscale hover:grayscale-0
              flex items-center justify-center cursor-pointer`}
              onClick={(e) => {
                if (item.link === "#") e.preventDefault();
              }}
            >
              <img
                src={item.src}
                alt={item.alt}
                className="max-w-full max-h-full object-contain pointer-events-none"
                draggable={false}
                loading="lazy"
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ImageMarquee;
