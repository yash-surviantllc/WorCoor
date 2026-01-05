/**
 * Warehouse Map Wrapper Component
 * 
 * A wrapper component that provides a clean interface for integrating
 * the Warehouse Maps viewer into external dashboards.
 * 
 * Usage:
 * import WarehouseMapWrapper from './integration/WarehouseMapWrapper';
 * 
 * <WarehouseMapWrapper 
 *   onBack={() => navigateToDashboard()}
 *   onNavigateToBuilder={() => navigateToBuilder()}
 *   onLayoutSelect={(layout) => console.log('Selected:', layout)}
 * />
 */

import React, { useEffect } from 'react';
import MainDashboard from '../components/MainDashboard';

const WarehouseMapWrapper = ({ 
  onBack, 
  onNavigateToBuilder,
  onLayoutSelect,
  showBackButton = true,
  backButtonStyle = {}
}) => {
  // Listen for layout selection events
  useEffect(() => {
    const handleLayoutSelect = (event) => {
      if (onLayoutSelect && event.detail) {
        onLayoutSelect(event.detail);
      }
    };

    window.addEventListener('layoutSelected', handleLayoutSelect);
    return () => window.removeEventListener('layoutSelected', handleLayoutSelect);
  }, [onLayoutSelect]);

  // Listen for layout saved events to refresh the view
  useEffect(() => {
    const handleLayoutSaved = () => {
      // Trigger a re-render or refresh of the warehouse maps
      window.dispatchEvent(new CustomEvent('refreshWarehouseMaps'));
    };

    window.addEventListener('layoutSaved', handleLayoutSaved);
    return () => window.removeEventListener('layoutSaved', handleLayoutSaved);
  }, []);

  const defaultBackButtonStyle = {
    position: 'fixed',
    top: '20px',
    left: '20px',
    zIndex: 10000,
    padding: '10px 20px',
    background: '#2196F3',
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

  const handleNavigateToBuilder = () => {
    if (onNavigateToBuilder) {
      onNavigateToBuilder();
    }
  };

  return (
    <div className="warehouse-map-wrapper" style={{ width: '100%', height: '100vh' }}>
      {showBackButton && onBack && (
        <button 
          onClick={onBack}
          style={defaultBackButtonStyle}
          onMouseEnter={(e) => {
            e.target.style.background = '#1976D2';
            e.target.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.background = '#2196F3';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          ← Back to Dashboard
        </button>
      )}
      <MainDashboard onNavigateToBuilder={handleNavigateToBuilder} />
    </div>
  );
};

export default WarehouseMapWrapper;
