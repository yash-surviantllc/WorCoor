/**
 * Layout Builder Wrapper Component
 * 
 * A wrapper component that provides a clean interface for integrating
 * the Layout Builder into external dashboards.
 * 
 * Usage:
 * import LayoutBuilderWrapper from './integration/LayoutBuilderWrapper';
 * 
 * <LayoutBuilderWrapper 
 *   onBack={() => navigateToDashboard()}
 *   onSaveComplete={(layoutData) => console.log('Saved:', layoutData)}
 * />
 */

import React, { useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import App from '../App';

const LayoutBuilderWrapper = ({ 
  onBack, 
  onSaveComplete,
  initialLayout = null,
  showBackButton = true,
  backButtonStyle = {}
}) => {
  // Load initial layout if provided
  useEffect(() => {
    if (initialLayout) {
      localStorage.setItem('loadLayoutData', JSON.stringify(initialLayout));
    }
  }, [initialLayout]);

  // Listen for layout save events
  useEffect(() => {
    const handleLayoutSaved = () => {
      if (onSaveComplete) {
        const savedLayouts = JSON.parse(localStorage.getItem('warehouseLayouts') || '[]');
        const latestLayout = savedLayouts[savedLayouts.length - 1];
        onSaveComplete(latestLayout);
      }
    };

    window.addEventListener('layoutSaved', handleLayoutSaved);
    return () => window.removeEventListener('layoutSaved', handleLayoutSaved);
  }, [onSaveComplete]);

  const defaultBackButtonStyle = {
    position: 'fixed',
    top: '20px',
    left: '20px',
    zIndex: 10000,
    padding: '10px 20px',
    background: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
    transition: 'all 0.3s ease',
    ...backButtonStyle
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="layout-builder-wrapper" style={{ width: '100%', height: '100vh' }}>
        {showBackButton && onBack && (
          <button 
            onClick={onBack}
            style={defaultBackButtonStyle}
            onMouseEnter={(e) => {
              e.target.style.background = '#45a049';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#4CAF50';
              e.target.style.transform = 'translateY(0)';
            }}
          >
            ← Back to Dashboard
          </button>
        )}
        <App showMainDashboard={false} />
      </div>
    </DndProvider>
  );
};

export default LayoutBuilderWrapper;
