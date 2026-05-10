import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading,
  className = '', 
  ...props 
}) => {
  
  const baseStyles = "font-header text-sm  lg:text-lg text-center my-3 px-6 py-2.5 rounded-full font-bold transition-all active:scale-95 cursor-pointer";
  
  const variantStyles = variant === 'primary' 
    ? 'bg-secondary text-primary hover:bg-secondary/90 shadow-md' 
    : 'bg-primary text-secondary border border-secondary/20 hover:bg-secondary/5';

  return (
    <button 
      className={`${baseStyles} ${variantStyles} ${className}`} 
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <span>Processing...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
};