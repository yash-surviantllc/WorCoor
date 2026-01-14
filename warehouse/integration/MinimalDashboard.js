/**
 * Minimal Dashboard Example
 * Copy this file to your dashboard project and customize
 */

import React, { useState } from 'react';
import LayoutBuilderWrapper from './LayoutBuilderWrapper';
import WarehouseMapWrapper from './WarehouseMapWrapper';
import '../index.css'; // Import WorCoor styles

const MinimalDashboard = () => {
  const [view, setView] = useState('home');

  if (view === 'builder') {
    return <LayoutBuilderWrapper onBack={() => setView('home')} />;
  }

  if (view === 'maps') {
    return (
      <WarehouseMapWrapper 
        onBack={() => setView('home')}
        onNavigateToBuilder={() => setView('builder')}
      />
    );
  }

  return (
    <div style={s.container}>
      <h1 style={s.title}>Warehouse Management</h1>
      <button onClick={() => setView('builder')} style={s.btn}>
        🏗️ Layout Builder
      </button>
      <button onClick={() => setView('maps')} style={s.btn}>
        🗺️ Warehouse Maps
      </button>
    </div>
  );
};

const s = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    gap: '20px',
    background: '#f5f5f5',
  },
  title: {
    fontSize: '32px',
    marginBottom: '20px',
  },
  btn: {
    padding: '15px 40px',
    fontSize: '16px',
    cursor: 'pointer',
    border: 'none',
    borderRadius: '8px',
    background: '#4CAF50',
    color: 'white',
    fontWeight: '600',
  },
};

export default MinimalDashboard;
