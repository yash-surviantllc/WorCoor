/**
 * Dashboard Router Component
 * Simple router for switching between dashboard views
 */

import React, { useState, useEffect } from 'react';
import LayoutBuilderWrapper from './LayoutBuilderWrapper';
import WarehouseMapWrapper from './WarehouseMapWrapper';

const DashboardRouter = ({ 
  defaultView = 'home',
  homeComponent: HomeComponent,
  onViewChange
}) => {
  const [currentView, setCurrentView] = useState(defaultView);
  const [layoutToEdit, setLayoutToEdit] = useState(null);

  useEffect(() => {
    if (onViewChange) {
      onViewChange(currentView);
    }
  }, [currentView, onViewChange]);

  const navigateToBuilder = (layout = null) => {
    setLayoutToEdit(layout);
    setCurrentView('layout-builder');
  };

  const navigateToMaps = () => {
    setLayoutToEdit(null);
    setCurrentView('warehouse-maps');
  };

  const navigateToHome = () => {
    setLayoutToEdit(null);
    setCurrentView('home');
  };

  // Render based on current view
  switch (currentView) {
    case 'layout-builder':
      return (
        <LayoutBuilderWrapper
          onBack={navigateToHome}
          initialLayout={layoutToEdit?.layoutData}
          onSaveComplete={(layout) => {
            console.log('Layout saved:', layout);
          }}
        />
      );

    case 'warehouse-maps':
      return (
        <WarehouseMapWrapper
          onBack={navigateToHome}
          onNavigateToBuilder={navigateToBuilder}
          onLayoutSelect={(layout) => {
            console.log('Layout selected:', layout);
          }}
        />
      );

    case 'home':
    default:
      if (HomeComponent) {
        return (
          <HomeComponent
            onNavigateToBuilder={navigateToBuilder}
            onNavigateToMaps={navigateToMaps}
          />
        );
      }
      
      // Default home view
      return (
        <div style={styles.container}>
          <h1 style={styles.title}>Warehouse Management</h1>
          <div style={styles.buttonContainer}>
            <button 
              onClick={() => navigateToBuilder()}
              style={styles.button}
            >
              🏗️ Layout Builder
            </button>
            <button 
              onClick={navigateToMaps}
              style={styles.button}
            >
              🗺️ Warehouse Maps
            </button>
          </div>
        </div>
      );
  }
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  title: {
    fontSize: '48px',
    color: 'white',
    marginBottom: '40px',
  },
  buttonContainer: {
    display: 'flex',
    gap: '20px',
  },
  button: {
    padding: '15px 30px',
    fontSize: '18px',
    background: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
    transition: 'transform 0.2s',
  },
};

export default DashboardRouter;
