import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IoClose } from 'react-icons/io5';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'medium', 
  showCloseButton = true,
  closeOnBackdropClick = true,
  showFooter = false,
  footerContent = null,
  onConfirm = null,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isLoading = false
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Handle escape key
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (e) => {
    if (closeOnBackdropClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  const sizeClasses = {
    small: 'max-w-md',
    medium: 'max-w-lg',
    large: 'max-w-2xl',
    xl: 'max-w-4xl',
    full: 'max-w-6xl',
    '3xl': 'max-w-7xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70"
            onClick={handleBackdropClick}
          />

          {/* Modal */}
          <div className="flex min-h-full items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className={`relative bg-white rounded-lg shadow-xl w-full ${sizeClasses[size]} transform transition-all dark:bg-gray-800 dark:shadow-2xl`}
            >
              {/* Header */}
              {(title || showCloseButton) && (
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                  {title && (
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {title}
                    </h3>
                  )}
                  {showCloseButton && (
                    <button
                      onClick={onClose}
                      className="p-1 text-gray-400 hover:text-gray-500 transition-colors dark:text-gray-500 dark:hover:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                      aria-label="Close modal"
                    >
                      <IoClose size={20} />
                    </button>
                  )}
                </div>
              )}

              {/* Body */}
              <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto dark:text-gray-300">
                {children}
              </div>

              {/* Footer (Optional) */}
              {showFooter && (
                <div className="flex justify-end gap-3 p-4 border-t border-gray-200 dark:border-gray-700">
                  {footerContent ? (
                    footerContent
                  ) : (
                    <>
                      <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                        disabled={isLoading}
                      >
                        {cancelText}
                      </button>
                      {onConfirm && (
                        <button
                          onClick={onConfirm}
                          className="px-4 py-2 text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={isLoading}
                        > 
                          {isLoading ? (
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Processing...
                            </div>
                          ) : (
                            confirmText
                          )}
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;