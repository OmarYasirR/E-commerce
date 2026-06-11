import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  IoCheckmarkCircle, 
  IoCloseCircle, 
  IoWarning, 
  IoInformation, 
  IoClose,
  IoNotificationsOutline
} from 'react-icons/io5';

// Toast manager with singleton pattern
let toastId = 0;
let listeners = [];
let isInitialized = false;

// Prevent duplicate listeners
const addListener = (listener) => {
  if (!listeners.includes(listener)) {
    listeners.push(listener);
  }
};

const removeListener = (listener) => {
  listeners = listeners.filter(l => l !== listener);
};

// Show toast function with debounce to prevent double toasts
let lastToastTime = 0;
const TOAST_DEBOUNCE_MS = 100;

export const showToast = (type, message, duration = 4000) => {
  // Prevent duplicate toasts in quick succession
  const now = Date.now();
  if (now - lastToastTime < TOAST_DEBOUNCE_MS) {
    return null;
  }
  lastToastTime = now;
  
  const id = toastId++;
  const toast = { id, type, message, duration };
  
  listeners.forEach(listener => {
    try {
      listener(toast);
    } catch (error) {
      console.error('Toast listener error:', error);
    }
  });
  
  // Auto remove after duration
  setTimeout(() => {
    listeners.forEach(listener => {
      try {
        listener({ id, type: 'remove' });
      } catch (error) {
        console.error('Toast removal error:', error);
      }
    });
  }, duration);
  
  return id;
};

// Clear all toasts
export const clearAllToasts = () => {
  listeners.forEach(listener => {
    try {
      listener({ type: 'clear-all' });
    } catch (error) {
      console.error('Clear all toasts error:', error);
    }
  });
};

// Toast Container Component
export const ToastContainer = () => {
  const [toasts, setToasts] = useState([]);
  const timeoutRefs = useRef({});
  
  useEffect(() => {
    const handleToast = (toast) => {
      if (toast.type === 'remove') {
        setToasts(prev => {
          // Clear timeout if exists
          if (timeoutRefs.current[toast.id]) {
            clearTimeout(timeoutRefs.current[toast.id]);
            delete timeoutRefs.current[toast.id];
          }
          return prev.filter(t => t.id !== toast.id);
        });
      } else if (toast.type === 'clear-all') {
        // Clear all timeouts
        Object.values(timeoutRefs.current).forEach(clearTimeout);
        timeoutRefs.current = {};
        setToasts([]);
      } else {
        setToasts(prev => {
          // Check if toast with same message already exists
          const exists = prev.some(t => t.message === toast.message && t.type === toast.type);
          if (exists) return prev;
          return [...prev, toast];
        });
        
        // Auto remove after duration
        const timeout = setTimeout(() => {
          setToasts(prev => prev.filter(t => t.id !== toast.id));
          delete timeoutRefs.current[toast.id];
        }, toast.duration);
        
        timeoutRefs.current[toast.id] = timeout;
      }
    };
    
    addListener(handleToast);
    return () => {
      removeListener(handleToast);
      // Clear all timeouts on unmount
      Object.values(timeoutRefs.current).forEach(clearTimeout);
    };
  }, []);
  
  const removeToast = (id) => {
    if (timeoutRefs.current[id]) {
      clearTimeout(timeoutRefs.current[id]);
      delete timeoutRefs.current[id];
    }
    setToasts(prev => prev.filter(t => t.id !== id));
  };
  
  const getToastStyles = (type) => {
    switch(type) {
      case 'success':
        return {
          bg: 'bg-green-50 dark:bg-green-900/20',
          border: 'border-green-500',
          icon: 'text-green-500',
          text: 'text-green-800 dark:text-green-200',
          progress: 'bg-green-500'
        };
      case 'error':
        return {
          bg: 'bg-red-50 dark:bg-red-900/20',
          border: 'border-red-500',
          icon: 'text-red-500',
          text: 'text-red-800 dark:text-red-200',
          progress: 'bg-red-500'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50 dark:bg-yellow-900/20',
          border: 'border-yellow-500',
          icon: 'text-yellow-500',
          text: 'text-yellow-800 dark:text-yellow-200',
          progress: 'bg-yellow-500'
        };
      case 'info':
        return {
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          border: 'border-blue-500',
          icon: 'text-blue-500',
          text: 'text-blue-800 dark:text-blue-200',
          progress: 'bg-blue-500'
        };
      default:
        return {
          bg: 'bg-gray-50 dark:bg-gray-800',
          border: 'border-gray-500',
          icon: 'text-gray-500',
          text: 'text-gray-800 dark:text-gray-200',
          progress: 'bg-gray-500'
        };
    }
  };
  
  const getIcon = (type) => {
    switch(type) {
      case 'success': return <IoCheckmarkCircle size={22} />;
      case 'error': return <IoCloseCircle size={22} />;
      case 'warning': return <IoWarning size={22} />;
      case 'info': return <IoInformation size={22} />;
      default: return <IoNotificationsOutline size={22} />;
    }
  };
  
  if (toasts.length === 0) return null;
  
  return createPortal(
    <div className="fixed top-4 right-4 z-50 space-y-3 pointer-events-none">
      {toasts.map((toast) => {
        const styles = getToastStyles(toast.type);
        return (
          <div
            key={toast.id}
            className={`relative flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border-l-4 min-w-[320px] max-w-md pointer-events-auto animate-slide-in ${styles.bg} ${styles.border}`}
            role="alert"
          >
            {/* Icon */}
            <div className={`${styles.icon}`}>
              {getIcon(toast.type)}
            </div>
            
            {/* Message */}
            <div className="flex-1">
              <p className={`text-sm font-medium ${styles.text}`}>
                {toast.message}
              </p>
            </div>
            
            {/* Close Button */}
            <button
              onClick={() => removeToast(toast.id)}
              className={`p-1 rounded-full transition-colors ${styles.text} hover:bg-opacity-20 hover:bg-gray-500`}
              aria-label="Close notification"
            >
              <IoClose size={16} />
            </button>
            
            {/* Progress Bar */}
            <div 
              className={`absolute bottom-0 left-0 h-1 ${styles.progress} rounded-b-lg`}
              style={{
                width: '100%',
                animation: `shrink ${toast.duration}ms linear forwards`
              }}
            />
          </div>
        );
      })}
    </div>,
    document.body
  );
};

// Toast component
export const Toast = ({ type, message, onClose }) => {
  const getStyles = () => {
    switch(type) {
      case 'success':
        return {
          bg: 'bg-green-50',
          border: 'border-green-500',
          icon: 'text-green-500',
          text: 'text-green-800',
          button: 'hover:bg-green-100'
        };
      case 'error':
        return {
          bg: 'bg-red-50',
          border: 'border-red-500',
          icon: 'text-red-500',
          text: 'text-red-800',
          button: 'hover:bg-red-100'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-500',
          icon: 'text-yellow-500',
          text: 'text-yellow-800',
          button: 'hover:bg-yellow-100'
        };
      case 'info':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-500',
          icon: 'text-blue-500',
          text: 'text-blue-800',
          button: 'hover:bg-blue-100'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-500',
          icon: 'text-gray-500',
          text: 'text-gray-800',
          button: 'hover:bg-gray-100'
        };
    }
  };
  
  const getIcon = () => {
    switch(type) {
      case 'success': return <IoCheckmarkCircle size={22} />;
      case 'error': return <IoCloseCircle size={22} />;
      case 'warning': return <IoWarning size={22} />;
      case 'info': return <IoInformation size={22} />;
      default: return <IoNotificationsOutline size={22} />;
    }
  };
  
  const styles = getStyles();
  
  return (
    <div className={`flex items-center justify-center gap-3 px-4 py-3 rounded-lg shadow-lg border-l-4 min-w-[320px] max-w-md ${styles.bg} ${styles.border}`}>
      <div className={styles.icon}>
        {getIcon()}
      </div>
      <div className="flex-1">
        <p className={`text-sm font-medium ${styles.text}`}>{message}</p>
      </div>
      <button
        onClick={onClose}
        className={`p-1 rounded-full transition-colors ${styles.text} ${styles.button}`}
      >
        <IoClose size={16} />
      </button>
    </div>
  );
};

// Pre-defined toast functions with built-in duplicate prevention
let lastCallTime = 0;
const callThrottle = (fn, ...args) => {
  const now = Date.now();
  if (now - lastCallTime > 500) {
    lastCallTime = now;
    return fn(...args);
  }
  return null;
};

export const toast = {
  success: (message, duration) => callThrottle(showToast, 'success', message, duration),
  error: (message, duration) => callThrottle(showToast, 'error', message, duration),
  warning: (message, duration) => callThrottle(showToast, 'warning', message, duration),
  info: (message, duration) => callThrottle(showToast, 'info', message, duration),
  clearAll: clearAllToasts,
};

export default { showToast, ToastContainer, Toast, toast };