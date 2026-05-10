import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

const Input = ({ label, error, ...props }: InputProps) => {
  return (
    <div className="w-full flex flex-col gap-2">
      <label className="text-[10px] font-bold uppercase tracking-[0.3em] text-secondary ml-1">
        {label}
      </label>
      <input
        {...props}
        className="w-full bg-transparent border-b border-secondary/10 py-3 px-1 text-secondary font-light text-md 
                   placeholder:text-secondary/30 focus:outline-none focus:border-secondary transition-colors"
      />
      {error && (
        <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest mt-1">
          {error}
        </span>
      )}
    </div>
  );
};

export default Input;