"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "../../lib/utils"; // Optional utility for className merging

export type CardContent = {
  id: string | number;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  bgClass?: string;
};

type SlidingCardsProps = {
  cards: CardContent[];
  className?: string;
  cardSize?: string;
  centerIcon?: React.ReactNode;
  visibleRange?: number;
  onCardClick?: (index: number) => void;
  autoPlay?: boolean;
  autoPlayInterval?: number;
};

const SlidingCards: React.FC<SlidingCardsProps> = ({
  cards,
  className = "",
  cardSize = "w-24 h-24",
  onCardClick,
  autoPlay = false,
  autoPlayInterval = 3000,
}) => {
  const cardStackRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLElement[]>([]);

  useEffect(() => {
    const cardStack = cardStackRef.current;
    if (!cardStack) return;
    cardsRef.current = Array.from(cardStack.querySelectorAll(".card"));

    let isSwiping = false;
    let isAnimating = false;
    let startX = 0;
    let currentX = 0;
    let animationFrameId: number | null = null;

    const getDuration = () => 300;

    const getActiveCard = () => cardsRef.current[0];

    const updatePositions = () => {
      cardsRef.current.forEach((card, i) => {
        const offset = i + 1;
        card.style.zIndex = `${100 - offset}`;
        card.style.transform = `perspective(700px) translateZ(${-12 * offset}px) translateY(${7 * offset}px) translateX(0px) rotateY(0deg)`;
        card.style.opacity = `1`;
      });
    };

    const applySwipeStyles = (deltaX: number) => {
      const card = getActiveCard();
      if (!card) return;
      const rotate = deltaX * 0.2;
      const opacity = 1 - Math.min(Math.abs(deltaX) / 100, 1) * 0.75;
      card.style.transform = `perspective(700px) translateZ(-12px) translateY(7px) translateX(${deltaX}px) rotateY(${rotate}deg)`;
      card.style.opacity = `${opacity}`;
    };

    const handleStart = (clientX: number) => {
      if (isSwiping || isAnimating) return;
      isSwiping = true;
      startX = currentX = clientX;
      const card = getActiveCard();
      card && (card.style.transition = "none");
    };

    const handleMove = (clientX: number) => {
      if (!isSwiping || isAnimating) return;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(() => {
        currentX = clientX;
        const deltaX = currentX - startX;
        applySwipeStyles(deltaX);
        if (Math.abs(deltaX) > 50) handleEnd();
      });
    };

    const handleEnd = () => {
      if (!isSwiping) return;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);

      const deltaX = currentX - startX;
      const threshold = 50;
      const duration = getDuration();
      const card = getActiveCard();

      if (card) {
        card.style.transition = `transform ${duration}ms ease, opacity ${duration}ms ease`;

        if (Math.abs(deltaX) > threshold) {
          isAnimating = true;
          const direction = Math.sign(deltaX);
          card.style.transform = `perspective(700px) translateZ(-12px) translateY(7px) translateX(${direction * 300}px) rotateY(${direction * 20}deg)`;

          setTimeout(() => {
            cardsRef.current = [...cardsRef.current.slice(1), card];
            updatePositions();
            isAnimating = false;
          }, duration);
        } else {
          applySwipeStyles(0);
        }
      }

      isSwiping = false;
      startX = currentX = 0;
    };

    const autoSlide = () => {
        if (isSwiping || isAnimating) return;
        const card = getActiveCard();
        if (!card) return;
        const duration = getDuration();
        isAnimating = true;
        card.style.transition = `transform ${duration}ms ease, opacity ${duration}ms ease`;
        card.style.transform = `perspective(700px) translateZ(-12px) translateY(7px) translateX(300px) rotateY(20deg)`;
        
        setTimeout(() => {
            cardsRef.current = [...cardsRef.current.slice(1), card];
            updatePositions();
            isAnimating = false;
        }, duration);
    };

    let intervalId: NodeJS.Timeout | null = null;
    if (autoPlay) {
        intervalId = setInterval(autoSlide, autoPlayInterval);
    }

    const onPointerDown = (e: PointerEvent) => handleStart(e.clientX);
    const onPointerMoveGlobal = (e: PointerEvent) => handleMove(e.clientX);
    const onPointerUpGlobal = () => handleEnd();

    cardStack.addEventListener("pointerdown", onPointerDown as EventListener);
    window.addEventListener("pointermove", onPointerMoveGlobal as EventListener);
    window.addEventListener("pointerup", onPointerUpGlobal);
    window.addEventListener("pointercancel", onPointerUpGlobal);

    updatePositions();

    return () => {
        if (intervalId) clearInterval(intervalId);
        cardStack.removeEventListener("pointerdown", onPointerDown as EventListener);
        window.removeEventListener("pointermove", onPointerMoveGlobal as EventListener);
        window.removeEventListener("pointerup", onPointerUpGlobal);
        window.removeEventListener("pointercancel", onPointerUpGlobal);
    };
  }, [autoPlay, autoPlayInterval]);

  return (
    <section
      ref={cardStackRef}
      className={cn(
        "relative w-[280px] h-[360px] grid place-content-center touch-none select-none",
        className
      )}
    >
      {cards.map(({ id, title, description, icon, bgClass = "bg-white" }, index) => (
        <article
          key={id}
          onClick={() => onCardClick?.(index)}
          className={cn(
            "card absolute inset-4 flex flex-col p-3 rounded-[2rem] border border-stone-200 premium-shadow cursor-grab transition-transform ease-in-out",
            bgClass
          )}
        >
          <div className="w-full flex-1 relative rounded-2xl overflow-hidden border border-stone-200/50 bg-stone-50">
            {icon || (
              <svg
                className="w-1/2 h-1/2 fill-stone-300 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 16 16"
              >
                <circle cx="8" cy="8" r="6" />
              </svg>
            )}
          </div>
          {(title || description) && (
            <div className="w-full pt-4 pb-2 px-2 text-center pointer-events-none shrink-0">
              {title && <h3 className="font-serif text-xl md:text-2xl font-bold text-editorial-ink leading-tight">{title}</h3>}
              {description && <p className="text-[10px] md:text-xs font-mono uppercase tracking-widest text-stone-500 mt-1.5">{description}</p>}
            </div>
          )}
        </article>
      ))}
    </section>
  );
};

export default SlidingCards;
