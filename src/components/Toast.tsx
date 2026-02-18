
import React, { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

export interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onClose: () => void;
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className={`fixed top-20 right-6 z-[60] flex items-center p-4 rounded-lg shadow-lg border animate-in slide-in-from-right fade-in duration-300 ${
      type === 'success' 
        ? 'bg-green-50 border-green-200 text-green-800' 
        : 'bg-red-50 border-red-200 text-red-800'
    }`}>
      <div className="flex-shrink-0 mr-3">
        {type === 'success' ? (
          <CheckCircle className="h-5 w-5 text-green-500" />
        ) : (
          <XCircle className="h-5 w-5 text-red-500" />
        )}
      </div>
      <div className="text-sm font-medium mr-8">{message}</div>
      <button 
        onClick={onClose}
        className={`p-1 rounded-full hover:bg-black/5 transition-colors ${
          type === 'success' ? 'text-green-600' : 'text-red-600'
        }`}
      >
        <X size={14} />
      </button>
    </div>
  );
};

export default Toast;
