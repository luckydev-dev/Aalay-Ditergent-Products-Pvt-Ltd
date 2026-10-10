import React from 'react';

interface PidiliteLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
  light?: boolean;
}

export const PidiliteLogo: React.FC<PidiliteLogoProps> = ({
  size = 'md',
  showTagline = true,
  className = '',
  light = false,
}) => {
  const containerSizes = {
    sm: 'gap-1.5',
    md: 'gap-2.5',
    lg: 'gap-3.5',
  };

  const swirlSizes = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-14',
  };

  const wordmarkSizes = {
    sm: 'text-lg font-black',
    md: 'text-2xl font-black tracking-tight',
    lg: 'text-3xl font-black tracking-tight',
  };

  const kickerSizes = {
    sm: 'text-[7px]',
    md: 'text-[9px]',
    lg: 'text-[11px]',
  };

  return (
    <div className={`flex items-center select-none ${containerSizes[size]} ${className}`}>
      {/* Lime Green Spiral Swirl Background Logo Icon */}
      <div className={`relative ${swirlSizes[size]} shrink-0 flex items-center justify-center`}>
        <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-sm">
          <defs>
            {/* Concentric spiral radial gradient */}
            <radialGradient id="swirlGrad" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="30%" stopColor="#B2E500" />
              <stop offset="65%" stopColor="#8ED000" />
              <stop offset="100%" stopColor="#15803d" />
            </radialGradient>
          </defs>
          
          {/* Swirl spiral background circles */}
          <circle cx="50" cy="50" r="48" fill="url(#swirlGrad)" />
          <circle cx="50" cy="50" r="38" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeOpacity="0.4" />
          <circle cx="50" cy="50" r="28" fill="none" stroke="#B2E500" strokeWidth="2" strokeOpacity="0.6" />
          <circle cx="50" cy="50" r="18" fill="none" stroke="#FFFFFF" strokeWidth="1.5" strokeOpacity="0.8" />
          <circle cx="50" cy="50" r="8" fill="#FFFFFF" />
        </svg>
      </div>

      {/* Brand Text Block */}
      <div className="flex flex-col justify-center leading-none">
        {showTagline && (
          <span 
            className={`${kickerSizes[size]} font-extrabold uppercase tracking-widest ${
              light ? 'text-[#B2E500]' : 'text-[#15803d]'
            } mb-0.5`}
            style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
          >
            DETERGENT CAKE · WASHING POWDER
          </span>
        )}
        <span
          className={`${wordmarkSizes[size]} ${
            light ? 'text-white' : 'text-[#0a3d1b]'
          } flex items-center font-black`}
          style={{ 
            letterSpacing: '-0.02em', 
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            textShadow: light ? '0 2px 4px rgba(0,0,0,0.2)' : '1px 1px 0px #FFFFFF, -1px -1px 0px #FFFFFF, 1px -1px 0px #FFFFFF, -1px 1px 0px #FFFFFF'
          }}
        >
          AALAY
        </span>
      </div>
    </div>
  );
};
