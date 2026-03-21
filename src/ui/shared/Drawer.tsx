import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: string;
  extra?: React.ReactNode;
}

export const Drawer: React.FC<DrawerProps> = ({
  open,
  onClose,
  title,
  children,
  width = 'w-[700px]',
  extra,
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (open) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 bg-black/40"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div
        className={`absolute right-0 top-0 h-full ${width} max-w-full transform bg-white shadow-2xl transition-transform`}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-900 truncate">{title}</h3>
            <div className="flex items-center gap-3">
              {extra}
              <button
                onClick={onClose}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
          {/* Body */}
          <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
        </div>
      </div>
    </div>
  );
};
