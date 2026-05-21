import React from 'react';

const ThemeLoader: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className={`relative ${sizeClasses[size]} animate-spin-slow`}>
        {/* Outer Ring */}
        <div className="absolute inset-0 border-4 border-secondary/10 rounded-full"></div>
        
        {/* Animated Segment */}
        <div className="absolute inset-0 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-1/2 h-1/2 bg-secondary rounded-sm rotate-45 animate-pulse shadow-lg flex items-center justify-center">
             <span className="text-[10px] text-white -rotate-45 font-black uppercase">የኛFIX</span>
          </div>
        </div>
      </div>
      
      <span className="text-[10px] md:text-xs font-black text-secondary uppercase tracking-[0.3em] animate-pulse">
        Loading...
      </span>
    </div>
  );
};

export default ThemeLoader;