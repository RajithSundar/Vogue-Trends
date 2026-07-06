import React from "react";
import { cn } from "../../lib/utils";

interface InteractiveGridBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  gridSize?: number;
  gridColor?: string;
  darkGridColor?: string;
  effectColor?: string;
  darkEffectColor?: string;
  trailLength?: number;
  glow?: boolean;
  glowRadius?: number;
  showFade?: boolean;
  fadeIntensity?: number;
}

export function InteractiveGridBackground({
  gridSize = 40,
  gridColor = "#d1d5db",
  darkGridColor = "#1f2937",
  effectColor = "rgba(0, 255, 255, 0.5)",
  darkEffectColor = "rgba(255, 0, 255, 0.5)",
  trailLength = 5,
  glow = true,
  glowRadius = 30,
  showFade = true,
  fadeIntensity = 25,
  className,
  children,
  ...props
}: InteractiveGridBackgroundProps) {
  return (
    <div
      className={cn("relative w-full h-full overflow-hidden bg-background", className)}
      {...props}
    >
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, ${gridColor} 1px, transparent 1px),
            linear-gradient(to bottom, ${gridColor} 1px, transparent 1px)
          `,
          backgroundSize: `${gridSize}px ${gridSize}px`,
          opacity: 0.3,
        }}
      />
      {glow && (
        <div 
          className="absolute inset-0 z-0 pointer-events-none opacity-50"
          style={{
            background: `radial-gradient(circle at center, ${effectColor} 0%, transparent ${glowRadius}%)`
          }}
        />
      )}
      {showFade && (
        <div 
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background: `linear-gradient(to bottom, transparent, var(--background) ${fadeIntensity}%)`
          }}
        />
      )}
      <div className="relative z-20 h-full">{children}</div>
    </div>
  );
}
