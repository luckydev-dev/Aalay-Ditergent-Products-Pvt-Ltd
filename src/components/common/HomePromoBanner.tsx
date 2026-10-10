import React, { useState } from 'react';

export const HomePromoBanner: React.FC = () => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <div className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-md border border-emerald-500/20 bg-gradient-to-r from-[#0d4a22] via-[#15803d] to-[#16a34a]">
      {!imageError ? (
        <div className="relative w-full overflow-hidden">
          {!imageLoaded && (
            <div className="w-full h-44 sm:h-52 bg-emerald-950/40 animate-pulse flex items-center justify-center">
              <span className="text-xs font-bold text-emerald-200/50">Loading Aalay...</span>
            </div>
          )}
          <img
            src="https://i.ibb.co/RqhNykK/hero-image.png"
            alt="Aalay Detergent Washing Powder & Soap"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            className={`w-full h-auto object-cover object-center block rounded-2xl sm:rounded-3xl transition-opacity duration-300 ${
              imageLoaded ? 'opacity-100' : 'opacity-0 absolute inset-0'
            }`}
            loading="eager"
          />
        </div>
      ) : (
        <div className="p-5 text-white flex flex-col justify-center min-h-[140px] relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#B2E500]/20 rounded-full blur-2xl pointer-events-none" />
          <span className="text-xs font-black tracking-wider text-[#B2E500] uppercase">
            AALAY DETERGENT
          </span>
          <h2 className="text-xl font-black mt-1 leading-tight">
            Brilliant Whiteness, Freshness Every Wash!
          </h2>
          <p className="text-xs text-emerald-100/90 mt-1">
            Tough stain removal washing powder & long-lasting detergent cake soap.
          </p>
        </div>
      )}
    </div>
  );
};
