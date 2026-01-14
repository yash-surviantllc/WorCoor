import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { createPortal } from 'react-dom';

interface PopupMessageProps {
  message: string;
  type?: 'info' | 'success' | 'error' | 'warning';
  onClose?: () => void;
  duration?: number | null;
}

const PopupMessage: React.FC<PopupMessageProps> = ({ message, type = 'info', onClose, duration = null }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, 300);
  };

  if (!isVisible) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: '#4CAF50',
          icon: '✓',
          iconColor: '#fff'
        };
      case 'error':
        return {
          backgroundColor: '#f44336',
          icon: '✕',
          iconColor: '#fff'
        };
      case 'warning':
        return {
          backgroundColor: '#FF9800',
          icon: '⚠',
          iconColor: '#fff'
        };
      default:
        return {
          backgroundColor: '#2196F3',
          icon: 'ℹ',
          iconColor: '#fff'
        };
    }
  };

  const typeStyles = getTypeStyles();

  const overlayStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    animation: isClosing ? 'fadeOut 0.3s ease-out' : 'fadeIn 0.3s ease-out',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  };

  const popupStyle: React.CSSProperties = {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
    maxWidth: '500px',
    minWidth: '300px',
    overflow: 'hidden',
    animation: isClosing ? 'slideOut 0.3s ease-out' : 'slideIn 0.3s ease-out',
    transform: isClosing ? 'scale(0.95)' : 'scale(1)',
    transition: 'transform 0.3s ease-out'
  };

  const headerStyle: React.CSSProperties = {
    backgroundColor: typeStyles.backgroundColor,
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  };

  const iconStyle: React.CSSProperties = {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: 'bold',
    color: typeStyles.iconColor,
    marginRight: '12px'
  };

  const titleStyle: React.CSSProperties = {
    color: 'white',
    fontSize: '18px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    flex: 1
  };

  const closeButtonStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    color: 'white',
    fontSize: '24px',
    cursor: 'pointer',
    padding: '0',
    width: '32px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    transition: 'background-color 0.2s ease',
    marginLeft: '12px'
  };

  const contentStyle: React.CSSProperties = {
    padding: '20px',
    fontSize: '15px',
    lineHeight: '1.6',
    color: '#333',
    whiteSpace: 'pre-wrap'
  };

  const footerStyle: React.CSSProperties = {
    padding: '16px 20px',
    borderTop: '1px solid #e0e0e0',
    display: 'flex',
    justifyContent: 'flex-end'
  };

  const okButtonStyle: React.CSSProperties = {
    backgroundColor: typeStyles.backgroundColor,
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '10px 24px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
  };

  const getTitle = () => {
    switch (type) {
      case 'success': return 'Success';
      case 'error': return 'Error';
      case 'warning': return 'Warning';
      default: return 'Information';
    }
  };

  // Only render on client side
  if (typeof window === 'undefined') {
    return null;
  }

  return createPortal(
    <>
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes fadeOut {
            from { opacity: 1; }
            to { opacity: 0; }
          }
          @keyframes slideIn {
            from { 
              opacity: 0;
              transform: translateY(-20px);
            }
            to { 
              opacity: 1;
              transform: translateY(0);
            }
          }
          @keyframes slideOut {
            from { 
              opacity: 1;
              transform: translateY(0);
            }
            to { 
              opacity: 0;
              transform: translateY(-20px);
            }
          }
        `}
      </style>
      <div style={overlayStyle} onClick={handleClose}>
        <div style={popupStyle} onClick={(e) => e.stopPropagation()}>
          <div style={headerStyle}>
            <div style={titleStyle}>
              <div style={iconStyle}>{typeStyles.icon}</div>
              {getTitle()}
            </div>
            <button 
              style={closeButtonStyle}
              onClick={handleClose}
              onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              ×
            </button>
          </div>
          <div style={contentStyle}>
            {message}
          </div>
          <div style={footerStyle}>
            <button 
              style={okButtonStyle}
              onClick={handleClose}
              onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.15)';
              }}
              onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
              }}
            >
              OK
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};

// Singleton manager for popup messages
class PopupManager {
  static instance: PopupManager | null = null;
  container: HTMLDivElement | null = null;
  root: ReturnType<typeof createRoot> | null = null;
  
  constructor() {
    if (PopupManager.instance) {
      return PopupManager.instance;
    }
    
    // Only initialize on client side
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      this.container = document.createElement('div');
      this.container.id = 'popup-message-container';
      document.body.appendChild(this.container);
      this.root = createRoot(this.container);
    }
    
    PopupManager.instance = this;
  }
  
  show(message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info', duration: number | null = null): Promise<void> {
    // Return resolved promise if not on client side
    if (typeof window === 'undefined' || !this.root) {
      return Promise.resolve();
    }
    
    return new Promise<void>((resolve) => {
      const handleClose = () => {
        if (this.root) {
          this.root.unmount();
        }
        resolve();
      };
      
      if (this.root) {
        this.root.render(
          <PopupMessage 
            message={message} 
            type={type} 
            onClose={handleClose}
            duration={duration}
          />
        );
      }
    });
  }
  
  info(message: string, duration: number | null = null): Promise<void> {
    return this.show(message, 'info', duration);
  }
  
  success(message: string, duration: number = 3000): Promise<void> {
    return this.show(message, 'success', duration);
  }
  
  error(message: string, duration: number | null = null): Promise<void> {
    return this.show(message, 'error', duration);
  }
  
  warning(message: string, duration: number | null = null): Promise<void> {
    return this.show(message, 'warning', duration);
  }
}

// Create singleton instance
const popupManager = new PopupManager();

// Export both the component and the manager
export { PopupMessage, popupManager };
export default popupManager;
