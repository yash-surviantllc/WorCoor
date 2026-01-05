/**
 * Integration Example
 * 
 * This file demonstrates how to integrate the Layout Builder and Warehouse Maps
 * into an external dashboard application.
 * 
 * Copy this example and modify it according to your dashboard's structure.
 */

import React, { useState } from 'react';
import LayoutBuilderWrapper from './LayoutBuilderWrapper';
import WarehouseMapWrapper from './WarehouseMapWrapper';

// Import the main CSS (adjust path as needed)
import '../index.css';

const DashboardIntegrationExample = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [selectedLayout, setSelectedLayout] = useState(null);

  // Handle navigation to Layout Builder
  const handleNavigateToBuilder = (layoutToEdit = null) => {
    if (layoutToEdit) {
      setSelectedLayout(layoutToEdit);
    }
    setActiveView('layout-builder');
  };

  // Handle navigation to Warehouse Maps
  const handleNavigateToMaps = () => {
    setActiveView('warehouse-maps');
  };

  // Handle back to dashboard
  const handleBackToDashboard = () => {
    setActiveView('dashboard');
    setSelectedLayout(null);
  };

  // Handle layout save completion
  const handleLayoutSaveComplete = (layoutData) => {
    console.log('Layout saved:', layoutData);
    // You can add custom logic here, like:
    // - Show a success notification
    // - Navigate to warehouse maps
    // - Update your dashboard state
  };

  // Handle layout selection in warehouse maps
  const handleLayoutSelect = (layout) => {
    console.log('Layout selected:', layout);
    setSelectedLayout(layout);
  };

  // Render the appropriate view
  const renderView = () => {
    switch (activeView) {
      case 'layout-builder':
        return (
          <LayoutBuilderWrapper
            onBack={handleBackToDashboard}
            onSaveComplete={handleLayoutSaveComplete}
            initialLayout={selectedLayout?.layoutData}
            showBackButton={true}
          />
        );

      case 'warehouse-maps':
        return (
          <WarehouseMapWrapper
            onBack={handleBackToDashboard}
            onNavigateToBuilder={handleNavigateToBuilder}
            onLayoutSelect={handleLayoutSelect}
            showBackButton={true}
          />
        );

      default:
        return (
          <div className="dashboard-home" style={styles.dashboardHome}>
            <div style={styles.dashboardContent}>
              <h1 style={styles.title}>Your Dashboard</h1>
              <p style={styles.subtitle}>Warehouse Management System Integration</p>
              
              <div style={styles.linksContainer}>
                <div 
                  style={styles.linkCard}
                  onClick={handleNavigateToBuilder}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                  }}
                >
                  <div style={styles.linkIcon}>🏗️</div>
                  <h2 style={styles.linkTitle}>Layout Builder</h2>
                  <p style={styles.linkDescription}>
                    Design and create warehouse layouts with drag-and-drop components
                  </p>
                  <ul style={styles.featureList}>
                    <li>Drag-and-drop design</li>
                    <li>Component palette</li>
                    <li>Save/Load layouts</li>
                    <li>Export to PNG/SVG/PDF</li>
                  </ul>
                </div>

                <div 
                  style={styles.linkCard}
                  onClick={handleNavigateToMaps}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                  }}
                >
                  <div style={styles.linkIcon}>🗺️</div>
                  <h2 style={styles.linkTitle}>Warehouse Maps</h2>
                  <p style={styles.linkDescription}>
                    View and manage saved warehouse layouts with live data
                  </p>
                  <ul style={styles.featureList}>
                    <li>View saved layouts</li>
                    <li>Search and filter</li>
                    <li>Live preview</li>
                    <li>Edit existing layouts</li>
                  </ul>
                </div>
              </div>

              {/* Optional: Show recent activity */}
              <div style={styles.recentActivity}>
                <h3 style={styles.sectionTitle}>Recent Activity</h3>
                <p style={styles.activityText}>
                  {localStorage.getItem('warehouseLayouts') 
                    ? `${JSON.parse(localStorage.getItem('warehouseLayouts')).length} layouts saved`
                    : 'No layouts saved yet'}
                </p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="dashboard-container" style={styles.container}>
      {renderView()}
    </div>
  );
};

// Inline styles for the example
const styles = {
  container: {
    width: '100%',
    height: '100vh',
    overflow: 'hidden',
  },
  dashboardHome: {
    width: '100%',
    height: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  dashboardContent: {
    maxWidth: '1200px',
    width: '100%',
  },
  title: {
    fontSize: '48px',
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: '10px',
    textShadow: '0 2px 4px rgba(0,0,0,0.2)',
  },
  subtitle: {
    fontSize: '20px',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: '60px',
  },
  linksContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '30px',
    marginBottom: '40px',
  },
  linkCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '30px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
  },
  linkIcon: {
    fontSize: '48px',
    marginBottom: '15px',
  },
  linkTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#333',
    marginBottom: '10px',
  },
  linkDescription: {
    fontSize: '14px',
    color: '#666',
    marginBottom: '20px',
    lineHeight: '1.6',
  },
  featureList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    fontSize: '13px',
    color: '#888',
  },
  recentActivity: {
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '12px',
    padding: '20px',
    backdropFilter: 'blur(10px)',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: 'white',
    marginBottom: '10px',
  },
  activityText: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.9)',
  },
};

export default DashboardIntegrationExample;
