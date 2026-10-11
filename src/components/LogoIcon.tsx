import React from 'react';

export const LogoIcon: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Neon glow backdrop */}
      <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/30 to-fuchsia-500/30 rounded-2xl blur-md pointer-events-none" />
      
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full relative z-10 drop-shadow-[0_0_10px_rgba(6,182,212,0.6)]"
      >
        <defs>
          <linearGradient id="cyanMagenta" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="50%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
          <linearGradient id="magentaCyan" x1="100%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ec4899" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Outer D frame (Cyan to Blue) */}
        <path
          d="M25 20 H58 C75 20 85 32 85 50 C85 68 75 80 58 80 H25 V20 Z"
          stroke="url(#cyanMagenta)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          filter="url(#glow)"
        />

        {/* Inner D geometric contour (Magenta) */}
        <path
          d="M37 34 H55 C63 34 69 40 69 50 C69 60 63 66 55 66 H37 V34 Z"
          stroke="url(#magentaCyan)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          opacity="0.9"
        />

        {/* Intersecting Link Chain (Cyan & Magenta diagonal loop) */}
        <path
          d="M32 68 L62 38 C67 33 75 33 80 38 C85 43 85 51 80 56 L50 86"
          stroke="url(#cyanMagenta)"
          strokeWidth="9"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M38 62 L58 42"
          stroke="#0f172a"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};
