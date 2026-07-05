import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';

const AnimatedButton = ({ 
  children, 
  onClick, 
  className = "", 
  variant = "dark", 
  fullWidth = false,
  icon = null
}) => {
  const isDark = variant === 'dark';
  const baseClasses = `
    relative overflow-hidden flex items-center justify-center gap-2
    font-mono text-xs font-bold tracking-[0.15em] uppercase rounded-none px-8 py-4
    transition-colors duration-300
    ${fullWidth ? 'w-full' : 'w-auto'}
    ${isDark ? 'bg-editorial-ink text-white' : 'bg-[#F9F8F6] text-editorial-ink border border-editorial-line'}
  `;

  return (
    <motion.button
      onClick={onClick}
      className={`${baseClasses} ${className} group`}
      whileHover="hover"
      whileTap={{ scale: 0.98 }}
    >
      <motion.div
        className="absolute inset-0 z-0 bg-editorial-accent opacity-0"
        variants={{
          hover: {
            opacity: 1,
            scale: [1, 1.05],
            transition: { duration: 0.3 }
          }
        }}
      />
      <span className="relative z-10 flex items-center gap-2">
        {children}
        {icon === "arrow" && (
          <motion.span
            variants={{
              hover: { x: 5 }
            }}
          >
            <ArrowRight className="h-4 w-4" />
          </motion.span>
        )}
      </span>
    </motion.button>
  );
};

export default AnimatedButton;
