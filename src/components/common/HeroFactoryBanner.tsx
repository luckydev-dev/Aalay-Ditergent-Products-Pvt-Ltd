import React from 'react';
import { Globe } from 'lucide-react';
import { PidiliteLogo } from './PidiliteLogo';

interface HeroFactoryBannerProps {
  onLanguageToggle?: () => void;
  currentLang?: string;
}

export const HeroFactoryBanner: React.FC<HeroFactoryBannerProps> = ({
  onLanguageToggle,
  currentLang = 'ENG',
}) => {
  return (
    <div className="relative w-full h-56 sm:h-64 overflow-hidden bg-gradient-to-b from-[#8ED000] via-[#B2E500] to-[#FFFFFF] select-none">
      {/* Sky backdrop with sun highlights */}
      <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_70%_20%,#ffffff_0%,transparent_60%)]" />

      {/* Modern Building Architecture SVG */}
      <svg
        viewBox="0 0 400 220"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full object-cover"
      >
        <defs>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#B2E500" />
            <stop offset="60%" stopColor="#D9F99D" />
            <stop offset="100%" stopColor="#FFFFFF" />
          </linearGradient>
          <linearGradient id="glassWall" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0d4a22" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#14532d" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#042310" stopOpacity="0.95" />
          </linearGradient>
          <linearGradient id="buildingFacade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#F1F5F9" />
          </linearGradient>
        </defs>

        {/* Sky background */}
        <rect width="400" height="220" fill="url(#skyGrad)" />

        {/* Clouds */}
        <ellipse cx="60" cy="40" rx="35" ry="12" fill="#ffffff" opacity="0.8" />
        <ellipse cx="85" cy="35" rx="28" ry="14" fill="#ffffff" opacity="0.9" />
        <ellipse cx="280" cy="50" rx="45" ry="15" fill="#ffffff" opacity="0.7" />

        {/* Flour Silos & Plant Background (Right side) */}
        <rect x="320" y="55" width="28" height="120" rx="6" fill="#E2E8F0" />
        <rect x="355" y="65" width="32" height="110" rx="6" fill="#CBD5E1" />
        <circle cx="334" cy="55" r="14" fill="#CBD5E1" />
        <circle cx="371" cy="65" r="16" fill="#94A3B8" />
        {/* Silo Logo Badge */}
        <rect x="323" y="85" width="22" height="12" rx="2" fill="#15803d" />
        <text x="334" y="93" textAnchor="middle" fontSize="3.5" fontWeight="bold" fill="#FFFFFF">
          WASH
        </text>

        {/* Flag Pole with Indian Flag (Left) */}
        <line x1="45" y1="40" x2="45" y2="180" stroke="#94A3B8" strokeWidth="2" />
        {/* Tricolor */}
        <g transform="translate(45, 42)">
          <rect x="0" y="0" width="30" height="6" fill="#FF9933" />
          <rect x="0" y="6" width="30" height="6" fill="#FFFFFF" />
          <rect x="0" y="12" width="30" height="6" fill="#138808" />
          <circle cx="15" cy="9" r="2.5" fill="none" stroke="#000080" strokeWidth="0.8" />
        </g>

        {/* Aalay Flag 2 */}
        <line x1="85" y1="60" x2="85" y2="180" stroke="#94A3B8" strokeWidth="1.5" />
        <g transform="translate(85, 62)">
          <rect x="0" y="0" width="26" height="14" rx="2" fill="#8ED000" />
          <circle cx="13" cy="7" r="4.5" fill="#FFFFFF" />
          <text x="13" y="10" textAnchor="middle" fontSize="3" fontWeight="black" fill="#0d4a22">
            AALAY
          </text>
        </g>

        {/* Main Headquarters Building */}
        <rect x="110" y="45" width="200" height="140" rx="4" fill="url(#buildingFacade)" />
        {/* Lime Green Roof Band */}
        <rect x="105" y="40" width="210" height="12" rx="2" fill="#8ED000" />

        {/* Main Arch & Aalay Signage */}
        <path d="M 150 52 L 270 52 L 260 90 L 160 90 Z" fill="#0d4a22" stroke="#14532d" strokeWidth="1" />
        {/* Sun Swirl Logo on building */}
        <circle cx="210" cy="60" r="5" fill="#FFFFFF" />
        <circle cx="210" cy="60" r="3" fill="#B2E500" />
        {/* Aalay Wordmark */}
        <text x="210" y="74" textAnchor="middle" fontSize="11" fontWeight="900" fill="#FFFFFF" fontFamily="sans-serif">
          AALAY DETERGENT
        </text>
        <text x="210" y="82" textAnchor="middle" fontSize="4.5" fontWeight="600" fill="#B2E500" fontFamily="sans-serif">
          Whiteness & Freshness in Every Wash
        </text>

        {/* Modern Glass Entrance & Portico */}
        <rect x="145" y="95" width="130" height="85" rx="3" fill="url(#glassWall)" />
        {/* Glass grid lines */}
        <line x1="145" y1="125" x2="275" y2="125" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.3" />
        <line x1="145" y1="150" x2="275" y2="150" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.3" />
        <line x1="175" y1="95" x2="175" y2="180" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.3" />
        <line x1="210" y1="95" x2="210" y2="180" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.3" />
        <line x1="245" y1="95" x2="245" y2="180" stroke="#FFFFFF" strokeWidth="0.5" opacity="0.3" />

        {/* Sliding Door Entrance */}
        <rect x="195" y="135" width="30" height="45" rx="1" fill="#020617" opacity="0.8" />
        <line x1="210" y1="135" x2="210" y2="180" stroke="#94A3B8" strokeWidth="1.5" />

        {/* Ground Asphalt / Pavement */}
        <rect x="0" y="175" width="400" height="45" fill="#334155" />
        <rect x="0" y="172" width="400" height="4" fill="#F1F5F9" />
        <line x1="0" y1="195" x2="400" y2="195" stroke="#F1F5F9" strokeWidth="2" strokeDasharray="10 10" />

        {/* White Aalay Detergent Delivery Truck (Right) */}
        <g transform="translate(265, 138)">
          {/* Cargo Container */}
          <rect x="15" y="10" width="75" height="42" rx="2" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1" />
          {/* Truck Aalay Logo */}
          <circle cx="52" cy="24" r="6" fill="#8ED000" />
          <text x="52" y="32" textAnchor="middle" fontSize="6.5" fontWeight="900" fill="#25208F">
            Aalay
          </text>
          <text x="52" y="44" textAnchor="middle" fontSize="3.5" fontWeight="bold" fill="#17145F">
            DETERGENT
          </text>
          {/* Truck Cabin */}
          <path d="M 90 24 L 108 28 L 112 52 L 90 52 Z" fill="#25208F" stroke="#17145F" strokeWidth="1" />
          <polygon points="94,28 104,31 104,40 94,40" fill="#FFFFFF" opacity="0.7" />
          {/* Wheels */}
          <circle cx="32" cy="52" r="7" fill="#0F172A" />
          <circle cx="32" cy="52" r="3.5" fill="#E2E8F0" />
          <circle cx="70" cy="52" r="7" fill="#0F172A" />
          <circle cx="70" cy="52" r="3.5" fill="#E2E8F0" />
          <circle cx="102" cy="52" r="7" fill="#0F172A" />
          <circle cx="102" cy="52" r="3.5" fill="#E2E8F0" />
        </g>

        {/* Decorative Green Shrubs */}
        <circle cx="120" cy="172" r="10" fill="#166534" />
        <circle cx="135" cy="172" r="8" fill="#15803D" />
        <circle cx="280" cy="172" r="10" fill="#166534" />
      </svg>

      {/* Top Bar with Language Selector */}
      <div className="absolute top-3 right-3 z-10">
        <button
          onClick={onLanguageToggle}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 text-slate-800 text-xs font-bold shadow-md hover:bg-white active:scale-95 transition-all backdrop-blur-sm cursor-pointer"
        >
          <Globe size={13} className="text-slate-700" />
          <span>{currentLang}</span>
        </button>
      </div>

      {/* Decorative gradient overlay at bottom for smooth card tuck */}
      <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-slate-900/30 to-transparent pointer-events-none" />
    </div>
  );
};
