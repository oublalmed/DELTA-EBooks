
import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  showText?: boolean;
  className?: string;
}

const sizeMap = {
  sm: { img: 'h-8', text: 'text-sm', sub: 'text-[8px]' },
  md: { img: 'h-12', text: 'text-lg', sub: 'text-[9px]' },
  lg: { img: 'h-16', text: 'text-2xl', sub: 'text-[10px]' },
  xl: { img: 'h-24', text: 'text-3xl', sub: 'text-xs' },
  hero: { img: 'h-32 sm:h-40', text: 'text-5xl sm:text-6xl', sub: 'text-sm' },
};

const Logo: React.FC<LogoProps> = ({ size = 'md', showText = true, className = '' }) => {
  const s = sizeMap[size];

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <img
        src="/logo.png"
        alt="Delta Wisdom"
        className={`${s.img} object-contain`}
        onError={(e) => {
          // Fallback if logo.png not found — render text logo
          (e.target as HTMLImageElement).style.display = 'none';
          const fallback = (e.target as HTMLImageElement).nextElementSibling as HTMLElement;
          if (fallback) fallback.style.display = 'flex';
        }}
      />
      {/* Fallback text logo */}
      <div className="hidden flex-col items-center" style={{ display: 'none' }}>
        <span className={`font-display font-medium text-themed ${s.text}`}>Delta</span>
        <span className="text-amber-600 font-serif italic" style={{ fontSize: size === 'hero' ? '2rem' : size === 'xl' ? '1.5rem' : '1rem' }}>Wisdom</span>
      </div>
      {showText && size !== 'hero' && (
        <p className={`text-themed-muted ${s.sub} tracking-[0.3em] uppercase font-bold mt-1`}>The Universal Wisdom Library</p>
      )}
    </div>
  );
};

export default Logo;
