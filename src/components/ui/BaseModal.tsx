/**
 * BaseModal Component
 * 
 * 统一的模态框组件
 */

import React, { useEffect, useCallback } from 'react';
import { LucideIcon, X } from 'lucide-react';
import { Button } from './Button';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  titleIcon?: LucideIcon;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlay?: boolean;
  showCloseButton?: boolean;
}

const SIZE_CLASSES = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-[90vw] max-h-[90vh]',
};

export function BaseModal({
  isOpen,
  onClose,
  title,
  titleIcon: TitleIcon,
  children,
  footer,
  size = 'md',
  closeOnOverlay = true,
  showCloseButton = true,
}: BaseModalProps) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={closeOnOverlay ? onClose : undefined}
    >
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-hidden="true"
      />
      
      <div
        className={`relative w-full ${SIZE_CLASSES[size]} rounded-2xl shadow-2xl flex flex-col max-h-[90vh]`}
        style={{ backgroundColor: '#1a1a1a' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: '#2a2a2a' }}>
          <div className="flex items-center gap-3">
            {TitleIcon && (
              <div 
                className="rounded-lg p-1.5"
                style={{ backgroundColor: 'rgba(107, 33, 168, 0.15)' }}
              >
                <TitleIcon size={18} style={{ color: '#c084fc' }} />
              </div>
            )}
            <h2 className="text-lg font-semibold" style={{ color: '#ffffff' }}>
              {title}
            </h2>
          </div>
          
          {showCloseButton && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg transition-colors hover:bg-white/5"
              aria-label="Close"
            >
              <X size={18} style={{ color: '#737373' }} />
            </button>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
        
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t" style={{ borderColor: '#2a2a2a' }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
