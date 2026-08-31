import React from 'react';
import { motion } from 'framer-motion';

export function Button({
  children,
  onClick,
  variant = 'coral', // 'coral' | 'blue' | 'secondary' | 'outline' | 'ghost'
  size = 'lg', // 'md' | 'lg' | 'xl'
  disabled = false,
  fullWidth = false,
  icon: Icon = null,
  iconPosition = 'right',
  type = 'button',
  className = ''
}) {
  const baseStyles = 'inline-flex items-center justify-center font-bold tracking-wide transition-all duration-200 rounded-2xl focus:outline-none focus:ring-4 select-none touch-manipulation cursor-pointer';

  const variants = {
    coral: 'bg-kiosk-coral text-white shadow-kiosk-coral hover:bg-kiosk-coral-hover focus:ring-kiosk-coral/40 active:bg-kiosk-coral-hover disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed',
    blue: 'bg-kiosk-blue text-white shadow-kiosk-md hover:bg-kiosk-blue-hover focus:ring-kiosk-blue/40 active:bg-kiosk-blue-hover disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none disabled:cursor-not-allowed',
    secondary: 'bg-kiosk-peach text-kiosk-charcoal hover:bg-kiosk-peach-dark focus:ring-kiosk-peach/50 active:bg-kiosk-peach-dark border border-kiosk-peach-dark/30 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed',
    outline: 'bg-white text-kiosk-charcoal border-2 border-slate-200 hover:border-kiosk-coral hover:text-kiosk-coral focus:ring-kiosk-coral/20 active:bg-slate-50 disabled:border-slate-200 disabled:text-slate-300 disabled:cursor-not-allowed',
    ghost: 'bg-transparent text-kiosk-charcoal hover:bg-slate-100 focus:ring-slate-200 active:bg-slate-200 disabled:text-slate-300 disabled:cursor-not-allowed'
  };

  const sizes = {
    md: 'h-12 px-6 text-base gap-2 min-h-[48px]',
    lg: 'h-14 px-8 text-lg gap-3 min-h-[56px]',
    xl: 'h-16 px-10 text-xl gap-4 min-h-[64px]'
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileTap={disabled ? {} : { scale: 0.97 }}
      whileHover={disabled ? {} : { y: -1 }}
      className={`
        ${baseStyles}
        ${variants[variant] || variants.coral}
        ${sizes[size] || sizes.lg}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
    >
      {Icon && iconPosition === 'left' && <Icon className="w-6 h-6 shrink-0" />}
      <span>{children}</span>
      {Icon && iconPosition === 'right' && <Icon className="w-6 h-6 shrink-0" />}
    </motion.button>
  );
}
