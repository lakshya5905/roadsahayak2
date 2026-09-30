import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: string;
  children: React.ReactNode;
  maxHeight?: string;
  showCloseButton?: boolean;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxHeight = 'max-h-[85%]',
  showCloseButton = true
}) => {
  // Handle ESC key inside sheet
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 z-50 flex flex-col justify-end overflow-hidden">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-black/75 backdrop-blur-xs transition-opacity duration-200"
        aria-hidden="true"
      />

      {/* Sheet Container */}
      <div 
        className={`
          relative w-full bg-[#141822] border-t border-[#262E40] rounded-t-3xl shadow-2xl
          flex flex-col ${maxHeight} z-10 transition-transform duration-200 ease-out
        `}
      >
        {/* Grab Handle */}
        <div className="w-full flex items-center justify-center pt-3 pb-1 cursor-grab active:cursor-grabbing">
          <div className="w-10 h-1 rounded-full bg-[#3B455E]" />
        </div>

        {/* Header */}
        {(title || showCloseButton) && (
          <div className="px-5 py-3 flex items-center justify-between border-b border-[#1E2533] shrink-0">
            <div>
              {typeof title === 'string' ? (
                <h3 className="text-base font-bold text-slate-100">{title}</h3>
              ) : (
                title
              )}
              {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
            </div>

            {showCloseButton && (
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-[#1C2230] border border-[#262E40] flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#252D3D] transition-colors"
                aria-label="Close sheet"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Content Area */}
        <div className="px-5 py-4 overflow-y-auto custom-scrollbar flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};
