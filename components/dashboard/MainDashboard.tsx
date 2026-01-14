// @ts-nocheck
import React, { useState } from 'react';
import WarehouseMapView from '../warehouse/views/MapView';

const MainDashboard = ({ onNavigateToBuilder }) => {
  const [activeSection, setActiveSection] = useState('warehouse-map');

  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '📊',
      active: false
    },
    {
      id: 'warehouse-map',
      label: 'Warehouse Map',
      icon: '🗺️',
      active: true,
      description: 'Interactive facility layout and asset management'
    },
    {
      id: 'layout-builder',
      label: 'Layout Builder',
      icon: '🏗️',
      active: false,
      onClick: onNavigateToBuilder
    },
    {
      id: 'inventory-tracker',
      label: 'Inventory Tracker',
      icon: '📦',
      active: false
    },
    {
      id: 'product-management',
      label: 'Product Management',
      icon: '🏷️',
      active: false
    },
    {
      id: 'task-management',
      label: 'Task Management',
      icon: '✅',
      active: false
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: '📈',
      active: false
    },
    {
      id: 'asset-management',
      label: 'Asset Management',
      icon: '🔧',
      active: false
    },
    {
      id: 'audit-management',
      label: 'Audit Management',
      icon: '🔍',
      active: false
    }
  ];

  const facilityData = {
    name: 'Warehouse Layout - Unit U1',
    description: 'Interactive facility layout and asset management',
    areas: [
      { id: 'unit-u1', name: 'Unit U1 Layout', type: 'layout' },
      { id: 'operational-areas', name: 'Operational Areas', type: 'areas' },
      { id: 'storage-zones', name: 'Storage Zones', type: 'storage' }
    ],
    zones: [
      { id: 'zone-a', name: 'Zone A', type: 'storage', color: '#4A90E2' },
      { id: 'zone-b', name: 'Zone B', type: 'storage', color: '#4A90E2' },
      { id: 'zone-c', name: 'Zone C', type: 'storage', color: '#4A90E2' },
      { id: 'zone-d', name: 'Zone D', type: 'storage', color: '#4A90E2' },
      { id: 'receiving', name: 'Receiving', type: 'receiving', color: '#7ED321' },
      { id: 'dispatch', name: 'Dispatch', type: 'dispatch', color: '#F5A623' },
      { id: 'office', name: 'Office', type: 'office', color: '#BD10E0' }
    ]
  };

  const handleNavClick = (item) => {
    if (item.onClick) {
      item.onClick();
    } else {
      setActiveSection(item.id);
    }
  };

  const renderMainContent = () => {
    switch (activeSection) {
      case 'warehouse-map':
        return <WarehouseMapView facilityData={facilityData} />;
      default:
        return (
          <div className="main-dashboard-placeholder">
            <div className="placeholder-content">
              <h2>{navigationItems.find(item => item.id === activeSection)?.label}</h2>
              <p>This section is under development.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="main-dashboard dark-mode">
      {/* Sidebar Navigation */}
      <div className="main-dashboard-sidebar">
        <div className="sidebar-header">
          <div className="logo-section">
            <div className="logo-icon">🏭</div>
            <div className="logo-text">WareFlow</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navigationItems.map((item) => (
            <div
              key={item.id}
              className={`nav-item ${item.active || activeSection === item.id ? 'active' : ''}`}
              onClick={() => handleNavClick(item)}
            >
              <div className="nav-icon">{item.icon}</div>
              <div className="nav-label">{item.label}</div>
              {item.active && <div className="nav-indicator"></div>}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-section">
            <div className="user-avatar">👤</div>
            <div className="user-info">
              <div className="user-name">Admin User</div>
              <div className="user-role">Warehouse Manager</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="main-dashboard-content">
        <div className="content-header">
          <div className="breadcrumb">
            <span className="breadcrumb-item">Dashboard</span>
            <span className="breadcrumb-separator">›</span>
            <span className="breadcrumb-item active">
              {navigationItems.find(item => item.id === activeSection)?.label}
            </span>
          </div>
          <div className="header-actions">
            <button className="action-btn">
              <span className="btn-icon">🔄</span>
              Refresh
            </button>
            <button className="action-btn">
              <span className="btn-icon">⚙️</span>
              Settings
            </button>
          </div>
        </div>

        <div className="content-body">
          {renderMainContent()}
        </div>
      </div>
    </div>
  );
};

export default MainDashboard;
