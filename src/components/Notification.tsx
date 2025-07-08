import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { FaCheckCircle, FaTimes } from 'react-icons/fa';

interface NotificationProps {
  message: string;
  type: 'success' | 'error';
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

const Notification = ({ message, type, isVisible, onClose, duration = 5000 }: NotificationProps) => {
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);
  useEffect(() => {
    const handleClickOutside = () => {
      if (isVisible) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.8 }}
          transition={{ 
            type: "spring", 
            stiffness: 400, 
            damping: 30,
            duration: 0.3 
          }}
          style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
          className="fixed top-12 sm:top-6 right-4 sm:right-6 z-50 max-w-sm sm:max-w-md w-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className={`
            flex items-center justify-between p-4 sm:p-5 rounded-2xl shadow-lg backdrop-blur-sm border
            ${type === 'success' 
              ? 'bg-green-900/90 border-green-500/30 text-green-100' 
              : 'bg-red-900/90 border-red-500/30 text-red-100'
            }
          `}>
            <div className="flex items-center space-x-3 sm:space-x-4">
              {type === 'success' ? (
                <FaCheckCircle className="text-green-400 text-xl sm:text-2xl flex-shrink-0" />
              ) : (
                <FaTimes className="text-red-400 text-xl sm:text-2xl flex-shrink-0" />
              )}
              <p className="text-sm sm:text-base font-medium">{message}</p>
            </div>            <button
              onClick={onClose}
              className="text-current hover:opacity-70 transition-opacity ml-2 sm:ml-3 flex-shrink-0"
              aria-label="Close notification"
            >
              <FaTimes className="text-sm sm:text-base" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Notification;
