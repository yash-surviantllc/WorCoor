import React, { useState } from 'react';

const TopNavbar = ({
  // Layout Info
  layoutName,
  selectedOrgUnit,
  onOrgUnitSelect,
  selectedOrgMap,
  onOrgMapSelect,
  
  // Facility Management
  onFacilityManager,
  onMeasurementTools,
  
  // File Operations
  onSave,
  onLoad,
  onClear,
  onImportCAD,
  onExportLayout,
  
  // View Controls
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onZoomFit,
  
  // Grid & Snap
  gridVisible,
  onToggleGrid,
  snapEnabled,
  onToggleSnap,
  
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  
  // Search & Dashboard
  onSearch,
  onToggleDashboard,
  
  // Boundary
  onAutoGenerateBoundary,
  
  // Status
  itemCount
}) => {
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Organizational Units - Only Warehouses
  const orgUnits = [
    { id: 'warehouse-1', name: 'Warehouse 1', location: 'Building A' },
    { id: 'warehouse-2', name: 'Warehouse 2', location: 'Building B' },
    { id: 'warehouse-3', name: 'Warehouse 3', location: 'Building C' }
  ];

  const toggleDropdown = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const closeDropdowns = () => {
    setActiveDropdown(null);
  };

  // Organization Mapping - Simplified unit maps
  const organizationMaps = {
    'warehouse-1': [
      { id: 'wh1-unit1', name: 'Unit 1', type: 'primary', description: 'Primary storage and operations area' },
      { id: 'wh1-unit2', name: 'Unit 2', type: 'secondary', description: 'Upper level storage and offices' },
      { id: 'wh1-unit3', name: 'Unit 3', type: 'specialized', description: 'Truck loading and receiving zones' },
      { id: 'wh1-unit4', name: 'Unit 4', type: 'specialized', description: 'Temperature-controlled storage' }
    ],
    'warehouse-2': [
      { id: 'wh2-unit1', name: 'Unit 1', type: 'primary', description: 'Central processing and storage' },
      { id: 'wh2-unit2', name: 'Unit 2', type: 'specialized', description: 'Product assembly and packaging' },
      { id: 'wh2-unit3', name: 'Unit 3', type: 'specialized', description: 'Inspection and testing area' },
      { id: 'wh2-unit4', name: 'Unit 4', type: 'secondary', description: 'Returns handling and sorting' }
    ],
    'warehouse-3': [
      { id: 'wh3-unit1', name: 'Unit 1', type: 'primary', description: 'Main distribution operations' },
      { id: 'wh3-unit2', name: 'Unit 2', type: 'specialized', description: 'Conveyor and sorting systems' },
      { id: 'wh3-unit3', name: 'Unit 3', type: 'secondary', description: 'Order staging and preparation' }
    ]
  };

  const handleOrgUnitChange = (orgUnit) => {
    if (onOrgUnitSelect) {
      onOrgUnitSelect({ orgUnit, status: { id: 'operational', name: 'Operational' } });
    }
    closeDropdowns();
  };

  const handleOrgMapChange = (orgMap) => {
    if (onOrgMapSelect) {
      onOrgMapSelect(orgMap);
    }
    closeDropdowns();
  };

  const getAvailableMaps = () => {
    if (!selectedOrgUnit) return [];
    return organizationMaps[selectedOrgUnit.id] || [];
  };

  const getMapTypeIcon = (type) => {
    switch (type) {
      case 'primary': return '🏢';
      case 'secondary': return '🏬';
      case 'specialized': return '🏭';
      default: return '📍';
    }
  };

  const getMapTypeColor = (type) => {
    switch (type) {
      case 'primary': return '#0969da';
      case 'secondary': return '#7c3aed';
      case 'specialized': return '#dc2626';
      default: return '#6b7280';
    }
  };

  return (
    <nav className="modern-navbar" onClick={closeDropdowns}>
      {/* Left Section - Brand & Selectors */}
      <div className="navbar-left">
        <div className="brand-section">
          <div className="brand-icon">🏭</div>
          <div className="brand-text">
            <div className="brand-title">WorCoor</div>
            <div className="brand-subtitle">Warehouse Designer</div>
          </div>
        </div>
        
        <div className="selector-group">
          {/* Warehouse Selector */}
          <div className="selector-item">
            <button 
              className="modern-selector"
              onClick={(e) => { e.stopPropagation(); toggleDropdown('orgUnit'); }}
            >
              <span className="selector-label">Warehouse</span>
              <span className="selector-value">
                {selectedOrgUnit ? selectedOrgUnit.name : 'Select Warehouse'}
              </span>
              <span className="selector-arrow">▼</span>
            </button>
            {activeDropdown === 'orgUnit' && (
              <div className="modern-dropdown">
                {orgUnits.map(unit => (
                  <button 
                    key={unit.id}
                    className={`dropdown-option ${selectedOrgUnit?.id === unit.id ? 'selected' : ''}`}
                    onClick={() => handleOrgUnitChange(unit)}
                  >
                    <span className="option-text">{unit.name}</span>
                    <span className="option-meta">{unit.location}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Unit Selector */}
          {selectedOrgUnit && (
            <div className="selector-item">
              <button 
                className="modern-selector"
                onClick={(e) => { e.stopPropagation(); toggleDropdown('orgMap'); }}
              >
                <span className="selector-label">Unit</span>
                <span className="selector-value">
                  {selectedOrgMap ? selectedOrgMap.name : 'Select Unit'}
                </span>
                <span className="selector-arrow">▼</span>
              </button>
              {activeDropdown === 'orgMap' && (
                <div className="modern-dropdown">
                  {getAvailableMaps().map(map => (
                    <button 
                      key={map.id}
                      className={`dropdown-option ${selectedOrgMap?.id === map.id ? 'selected' : ''}`}
                      onClick={() => handleOrgMapChange(map)}
                    >
                      <span className="option-text">{map.name}</span>
                      <span className="option-meta">{map.description}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Center Section - Actions */}
      <div className="navbar-center">
        <div className="action-group">
          {/* File Actions */}
          <div className="action-item">
            <button 
              className="action-btn"
              onClick={(e) => { e.stopPropagation(); toggleDropdown('file'); }}
            >
              <span className="action-text">File</span>
            </button>
            {activeDropdown === 'file' && (
              <div className="action-dropdown">
                <button onClick={onSave} className="action-option">
                  <span className="option-icon">💾</span>
                  <span>Save Layout</span>
                </button>
                <div className="dropdown-separator"></div>
                <button onClick={() => onExportLayout('png')} className="action-option">
                  <span className="option-icon">🖼️</span>
                  <span>Export PNG</span>
                </button>
                <button onClick={() => onExportLayout('svg')} className="action-option">
                  <span className="option-icon">🎨</span>
                  <span>Export SVG</span>
                </button>
                <button onClick={() => onExportLayout('pdf')} className="action-option">
                  <span className="option-icon">📋</span>
                  <span>Export PDF</span>
                </button>
                <div className="dropdown-separator"></div>
                <button onClick={onClear} className="action-option danger">
                  <span className="option-icon">🗑️</span>
                  <span>Clear All</span>
                </button>
              </div>
            )}
          </div>

          {/* View Actions */}
          <div className="action-item">
            <button 
              className="action-btn"
              onClick={(e) => { e.stopPropagation(); toggleDropdown('view'); }}
            >
              <span className="action-text">View</span>
            </button>
            {activeDropdown === 'view' && (
              <div className="action-dropdown">
                <button 
                  onClick={onToggleGrid}
                  className={`action-option ${gridVisible ? 'active' : ''}`}
                >
                  <span className="option-icon">⚏</span>
                  <span>{gridVisible ? 'Hide' : 'Show'} Grid</span>
                </button>
                <button 
                  onClick={onToggleSnap}
                  className={`action-option ${snapEnabled ? 'active' : ''}`}
                >
                  <span className="option-icon">🎯</span>
                  <span>{snapEnabled ? 'Disable' : 'Enable'} Snap</span>
                </button>
              </div>
            )}
          </div>

          {/* Tools Actions */}
          <div className="action-item">
            <button 
              className="action-btn"
              onClick={(e) => { e.stopPropagation(); toggleDropdown('tools'); }}
            >
              <span className="action-text">Tools</span>
            </button>
            {activeDropdown === 'tools' && (
              <div className="action-dropdown">
                <button onClick={onAutoGenerateBoundary} className="action-option">
                  <span className="option-icon">⬜</span>
                  <span>Auto-Generate Boundary</span>
                </button>
                <div className="dropdown-separator"></div>
                <button onClick={onFacilityManager} className="action-option">
                  <span className="option-icon">🏢</span>
                  <span>Facility Manager</span>
                </button>
                <button onClick={onSearch} className="action-option">
                  <span className="option-icon">🔍</span>
                  <span>Search Items</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right Section - Controls & Status */}
      <div className="navbar-right">
        <div className="control-group">
          <button 
            className={`control-btn ${!canUndo ? 'disabled' : ''}`}
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo"
          >
            ↶
          </button>
          <button 
            className={`control-btn ${!canRedo ? 'disabled' : ''}`}
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo"
          >
            ↷
          </button>
        </div>
        
        <div className="status-group">
          <div className="status-badge">
            <span className="status-count">{itemCount}</span>
            <span className="status-label">items</span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default TopNavbar;
