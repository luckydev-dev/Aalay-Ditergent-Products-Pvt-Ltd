import React from 'react';

interface ProductImageProps {
  type?: 'fevicol' | 'drfixit' | 'mseal' | 'tilefix' | 'laticrete' | 'acrylic' | string;
  imageUrl?: string;
  alt?: string;
  className?: string;
}

export const ProductImage: React.FC<ProductImageProps> = ({
  type = 'fevicol',
  imageUrl,
  alt = 'Aalay Product',
  className = 'w-24 h-24',
}) => {
  const [imgError, setImgError] = React.useState(false);

  React.useEffect(() => {
    setImgError(false);
  }, [imageUrl]);

  if (imageUrl && imageUrl.trim() && !imgError) {
    return (
      <div
        className={`relative flex items-center justify-center rounded-2xl bg-white overflow-hidden shadow-inner border border-slate-200/80 ${className}`}
      >
        <img
          src={imageUrl}
          alt={alt}
          className="w-full h-full object-cover rounded-2xl"
          onError={() => setImgError(true)}
          loading="lazy"
        />
      </div>
    );
  }

  switch (type) {
    case 'fevicol': // AALAY Active Wash Detergent Powder Pouch
      return (
        <div className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-b from-[#B2E500]/15 via-blue-50 to-[#8ED000]/25 p-2 overflow-hidden shadow-inner border border-[#8ED000]/40 ${className}`}>
          {/* Bubbles watermark */}
          <div className="absolute inset-0 bg-[radial-gradient(#38BDF8_1.5px,transparent_1.5px)] [background-size:12px_12px] opacity-15" />
          <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-md">
            {/* Detergent Powder Pouch Body */}
            <path d="M 22 25 L 98 25 L 90 102 L 30 102 Z" fill="#8ED000" stroke="#79B500" strokeWidth="1.5" />
            <rect x="20" y="22" width="80" height="5" rx="1.5" fill="#25208F" />
            {/* White clean dynamic wave */}
            <path d="M 23 45 Q 60 28 97 45 L 94 92 Q 60 105 26 92 Z" fill="#FFFFFF" />
            {/* Royal blue active curve */}
            <path d="M 25 55 Q 60 40 95 58 L 92 84 Q 60 96 28 82 Z" fill="#25208F" />
            {/* Enzyme dots (micro granules) */}
            <circle cx="38" cy="68" r="2.5" fill="#38BDF8" />
            <circle cx="48" cy="74" r="2" fill="#F43F5E" />
            <circle cx="72" cy="70" r="2.5" fill="#B2E500" />
            <circle cx="82" cy="75" r="2" fill="#FACC15" />
            {/* Clean T-Shirt Symbol */}
            <path d="M 52 48 L 56 46 L 60 49 L 64 46 L 68 48 L 72 52 L 67 54 L 66 62 L 54 62 L 53 54 L 48 52 Z" fill="#FFFFFF" />
            {/* Brand text */}
            <text x="60" y="40" textAnchor="middle" fontSize="9" fontWeight="950" fill="#25208F" fontFamily="sans-serif">
              AALAY
            </text>
            <text x="60" y="69" textAnchor="middle" fontSize="4.2" fontWeight="900" fill="#FFFFFF" fontFamily="sans-serif">
              ACTIVE WASH
            </text>
            <text x="60" y="94" textAnchor="middle" fontSize="4.5" fontWeight="900" fill="#25208F" fontFamily="sans-serif">
              POWDER 1KG
            </text>
          </svg>
        </div>
      );

    case 'drfixit': // AALAY Super White Detergent Cake Soap (Pack of 6)
      return (
        <div className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-b from-blue-50 to-blue-100/60 p-2 overflow-hidden shadow-inner border border-blue-200 ${className}`}>
          <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-md">
            {/* 3D Isometric Laundry Soap Cake Bar */}
            {/* Top face */}
            <polygon points="15,48 55,26 105,38 65,62" fill="#60A5FA" stroke="#2563EB" strokeWidth="1.2" />
            {/* Front face */}
            <polygon points="15,48 65,62 65,92 15,78" fill="#2563EB" stroke="#1D4ED8" strokeWidth="1.2" />
            {/* Right side face */}
            <polygon points="65,62 105,38 105,68 65,92" fill="#1D4ED8" stroke="#1E40AF" strokeWidth="1.2" />

            {/* Bright Active Center Stripe on front face */}
            <polygon points="15,60 65,74 65,80 15,66" fill="#FFFFFF" opacity="0.95" />
            {/* White stripe on top face */}
            <polygon points="35,37 75,50 82,46 42,33" fill="#FFFFFF" opacity="0.8" />

            {/* Embossed Brand text on top face */}
            <text
              x="60"
              y="46"
              textAnchor="middle"
              fontSize="9"
              fontWeight="950"
              fill="#FFFFFF"
              transform="rotate(12 60 46)"
              fontFamily="sans-serif"
            >
              AALAY
            </text>

            {/* Text on front face */}
            <text
              x="40"
              y="74"
              textAnchor="middle"
              fontSize="4.5"
              fontWeight="900"
              fill="#25208F"
              transform="rotate(15 40 74)"
              fontFamily="sans-serif"
            >
              SOAP CAKE
            </text>

            {/* Fresh Lemon slice badge */}
            <circle cx="95" cy="84" r="14" fill="#FACC15" stroke="#EAB308" strokeWidth="1.5" />
            <circle cx="95" cy="84" r="11" fill="#FEF08A" />
            <path d="M 95 73 L 95 95 M 84 84 L 106 84 M 87 76 L 103 92 M 87 92 L 103 76" stroke="#CA8A04" strokeWidth="1" />
            {/* Whiteness Star */}
            <polygon points="25,25 27,31 33,33 27,35 25,41 23,35 17,33 23,31" fill="#38BDF8" />
          </svg>
        </div>
      );

    case 'mseal': // AALAY Lemon & Neem Fresh Washing Powder 3kg
      return (
        <div className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-b from-amber-50 to-lime-100/60 p-2 overflow-hidden shadow-inner border border-lime-200 ${className}`}>
          <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-md">
            {/* Bag Shape */}
            <path d="M 24 22 L 96 22 L 92 100 L 28 100 Z" fill="#FACC15" stroke="#EAB308" strokeWidth="1.5" />
            {/* Green Fresh Wave */}
            <path d="M 24 38 Q 60 55 95 36 L 93 90 Q 60 70 27 90 Z" fill="#15803D" />
            {/* White brand container */}
            <rect x="34" y="26" width="52" height="22" rx="4" fill="#FFFFFF" stroke="#8ED000" strokeWidth="1" />
            <text x="60" y="38" textAnchor="middle" fontSize="7.5" fontWeight="950" fill="#25208F" fontFamily="sans-serif">
              AALAY
            </text>
            <text x="60" y="45" textAnchor="middle" fontSize="3.5" fontWeight="900" fill="#15803D" fontFamily="sans-serif">
              LEMON & NEEM
            </text>
            {/* Neem Leaf Symbol */}
            <path d="M 60 55 C 50 62 48 76 60 82 C 72 76 70 62 60 55 Z" fill="#8ED000" stroke="#166534" strokeWidth="1" />
            <path d="M 60 57 L 60 80" stroke="#166534" strokeWidth="0.8" />
            {/* Lather foam bubbles */}
            <circle cx="36" cy="74" r="5" fill="#FFFFFF" opacity="0.9" />
            <circle cx="44" cy="78" r="3.5" fill="#FFFFFF" opacity="0.9" />
            <circle cx="80" cy="74" r="5" fill="#FFFFFF" opacity="0.9" />
            <text x="60" y="95" textAnchor="middle" fontSize="4.5" fontWeight="900" fill="#15803D" fontFamily="sans-serif">
              WASHING POWDER
            </text>
          </svg>
        </div>
      );

    case 'tilefix': // AALAY Blue Shine Power Detergent Cake Bar
      return (
        <div className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-b from-cyan-50 to-blue-100/60 p-2 overflow-hidden shadow-inner border border-cyan-200 ${className}`}>
          <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-md">
            {/* Soap bar wrapper */}
            <rect x="18" y="32" width="84" height="56" rx="10" fill="#25208F" stroke="#17145F" strokeWidth="1.5" />
            {/* Lime swirl wrapper stripe */}
            <path d="M 18 48 Q 60 32 102 48 L 102 72 Q 60 88 18 72 Z" fill="#8ED000" />
            {/* White oval logo plate */}
            <ellipse cx="60" cy="60" rx="30" ry="16" fill="#FFFFFF" stroke="#B2E500" strokeWidth="1.5" />
            {/* Text on oval */}
            <text x="60" y="58" textAnchor="middle" fontSize="8" fontWeight="950" fill="#25208F" fontFamily="sans-serif">
              AALAY
            </text>
            <text x="60" y="66" textAnchor="middle" fontSize="3.8" fontWeight="900" fill="#17145F" fontFamily="sans-serif">
              BLUE SHINE CAKE
            </text>
            {/* Sparkling stars */}
            <polygon points="26,38 27.5,42 32,43 27.5,45 26,50 24.5,45 20,43 24.5,42" fill="#FFFFFF" />
            <polygon points="94,76 95.5,80 100,81 95.5,83 94,88 92.5,83 88,81 92.5,80" fill="#FDE047" />
            {/* 100% Stain Removal Badge */}
            <circle cx="86" cy="38" r="8" fill="#EF4444" stroke="#DC2626" strokeWidth="1" />
            <text x="86" y="41" textAnchor="middle" fontSize="3.5" fontWeight="900" fill="#FFFFFF">
              STAIN
            </text>
          </svg>
        </div>
      );

    case 'laticrete': // AALAY Matic Machine Wash Detergent Bucket 5kg
      return (
        <div className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-b from-[#8ED000]/15 to-blue-100/50 p-2 overflow-hidden shadow-inner border border-blue-200 ${className}`}>
          <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-md">
            {/* Bucket Container */}
            <path d="M 28 35 L 35 98 L 85 98 L 92 35 Z" fill="#FFFFFF" stroke="#CBD5E1" strokeWidth="1.5" />
            {/* Bucket Handle */}
            <path d="M 26 35 Q 60 10 94 35" fill="none" stroke="#25208F" strokeWidth="3" />
            {/* Bucket Rim Lid */}
            <rect x="24" y="32" width="72" height="6" rx="2" fill="#25208F" />
            {/* Big Label on Bucket */}
            <path d="M 30 45 L 34 82 L 86 82 L 90 45 Z" fill="#8ED000" />
            <rect x="36" y="48" width="48" height="28" rx="3" fill="#FFFFFF" stroke="#25208F" strokeWidth="1" />
            {/* Washing Machine Icon inside label */}
            <rect x="40" y="52" width="12" height="16" rx="1.5" fill="#E2E8F0" stroke="#64748B" strokeWidth="0.8" />
            <circle cx="46" cy="61" r="3.5" fill="#38BDF8" stroke="#0284C7" strokeWidth="0.5" />
            {/* Text on Bucket */}
            <text x="66" y="57" textAnchor="middle" fontSize="5.5" fontWeight="950" fill="#25208F" fontFamily="sans-serif">
              AALAY
            </text>
            <text x="66" y="65" textAnchor="middle" fontSize="3.8" fontWeight="900" fill="#17145F" fontFamily="sans-serif">
              MATIC
            </text>
            <text x="66" y="73" textAnchor="middle" fontSize="3" fontWeight="bold" fill="#059669" fontFamily="sans-serif">
              5KG BUCKET
            </text>
            {/* Detergent Scoop on side */}
            <path d="M 86 78 L 102 70 L 100 66 L 85 73 Z" fill="#38BDF8" />
            <ellipse cx="101" cy="68" rx="3" ry="5" fill="#0284C7" />
          </svg>
        </div>
      );

    default: // acrylic / AALAY Ultra Clean Soap Bar Family Pack (Bundle of 4)
      return (
        <div className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-b from-blue-50 to-[#8ED000]/20 p-2 overflow-hidden shadow-inner border border-[#8ED000]/30 ${className}`}>
          <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-md">
            {/* Stack of Detergent Soap Cakes */}
            {/* Soap 1 (Bottom) */}
            <rect x="22" y="72" width="76" height="20" rx="4" fill="#1D4ED8" stroke="#1E40AF" strokeWidth="1" />
            <rect x="26" y="76" width="68" height="12" rx="2" fill="#3B82F6" />
            {/* Soap 2 (Middle) */}
            <rect x="22" y="52" width="76" height="20" rx="4" fill="#2563EB" stroke="#1D4ED8" strokeWidth="1" />
            <rect x="26" y="56" width="68" height="12" rx="2" fill="#60A5FA" />
            {/* Soap 3 (Top) */}
            <rect x="22" y="32" width="76" height="20" rx="4" fill="#8ED000" stroke="#79B500" strokeWidth="1" />
            <rect x="26" y="36" width="68" height="12" rx="2" fill="#FFFFFF" />
            {/* Wordmark on top bar */}
            <text x="60" y="45" textAnchor="middle" fontSize="6.5" fontWeight="950" fill="#25208F" fontFamily="sans-serif">
              AALAY
            </text>
            <text x="60" y="65" textAnchor="middle" fontSize="4.5" fontWeight="900" fill="#FFFFFF" fontFamily="sans-serif">
              DETERGENT CAKE
            </text>
            <text x="60" y="85" textAnchor="middle" fontSize="4.2" fontWeight="bold" fill="#FFFFFF" fontFamily="sans-serif">
              FAMILY PACK OF 4
            </text>
            {/* Ribbon wrapping */}
            <rect x="52" y="28" width="16" height="66" fill="#FACC15" opacity="0.85" rx="1" />
          </svg>
        </div>
      );
  }
};
