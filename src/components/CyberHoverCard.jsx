import React from 'react';
import '../cyber-card.css';

export default function CyberHoverCard({ children, className = '' }) {
  // Create 25 tracker divs
  const trackers = Array.from({ length: 25 }).map((_, i) => (
    <div key={i} className={`tracker tr-${i + 1}`}></div>
  ));

  return (
    <div className={`cyber-container noselect ${className}`}>
      <div className="canvas">
        {trackers}
        <div className="cyber-card">
          <div className="cyber-card-content">
            {children}
          </div>
          
          <div className="card-glare"></div>
          
          <div className="cyber-lines">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
          
          <div className="corner-elements">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
          
          <div className="scan-line"></div>
          
          <div className="cyber-glowing-elements">
            <div className="glow-1"></div>
            <div className="glow-2"></div>
            <div className="glow-3"></div>
          </div>
          
          <div className="cyber-card-particles">
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </div>
  );
}
