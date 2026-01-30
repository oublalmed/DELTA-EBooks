import React from 'react';

interface AdBannerProps {
  placement?: string;
  variant?: 'banner' | 'medium' | 'leaderboard';
  className?: string;
}

const sizeMap: Record<NonNullable<AdBannerProps['variant']>, string> = {
  banner: 'h-16',
  medium: 'h-40',
  leaderboard: 'h-24',
};

const AdBanner: React.FC<AdBannerProps> = ({ placement = 'default', variant = 'banner', className = '' }) => {
  return (
    <div className={`ad-banner rounded-2xl p-4 ${className}`}>
      <div className="flex items-center justify-between text-[10px] uppercase tracking-wider font-bold text-themed-muted">
        <span>Advertisement</span>
        <span className="text-themed-sub">Mobile Ad Slot</span>
      </div>
      <div className={`mt-3 w-full ${sizeMap[variant]} bg-themed-card border border-themed rounded-xl flex items-center justify-center`}>
        <div className="text-center">
          <div className="text-[10px] uppercase tracking-wider font-bold text-themed-muted">Sponsored</div>
          <p className="text-themed-sub text-xs mt-1">Ad placement: {placement}</p>
        </div>
      </div>
    </div>
  );
};

export default AdBanner;
