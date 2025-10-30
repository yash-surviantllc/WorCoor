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
  onNavigateToDashboard,
  
  // Boundary
  onAutoGenerateBoundary,
  
  // Status
  itemCount
}) => {
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Organizational hierarchy with nested units (mirrors live warehouse map grouping)
  const orgHierarchy = [
    {
      id: 'warehouse-1',
      name: 'Warehouse 1',
      location: 'Building A',
      units: [
        { id: 'wh1-unit1', name: 'Unit 1', description: 'Primary storage and operations area' },
        { id: 'wh1-unit2', name: 'Unit 2', description: 'Upper level storage and offices' },
        { id: 'wh1-unit3', name: 'Unit 3', description: 'Truck loading and receiving zones' },
        { id: 'wh1-unit4', name: 'Unit 4', description: 'Temperature-controlled storage' }
      ]
    },
    {
      id: 'warehouse-2',
      name: 'Warehouse 2',
      location: 'Building B',
      units: [
        { id: 'wh2-unit1', name: 'Unit 1', description: 'Central processing and storage' },
        { id: 'wh2-unit2', name: 'Unit 2', description: 'Product assembly and packaging' },
        { id: 'wh2-unit3', name: 'Unit 3', description: 'Inspection and testing area' },
        { id: 'wh2-unit4', name: 'Unit 4', description: 'Returns handling and sorting' }
      ]
    },
    {
      id: 'warehouse-3',
      name: 'Warehouse 3',
      location: 'Building C',
      units: [
        { id: 'wh3-unit1', name: 'Unit 1', description: 'Main distribution operations' },
        { id: 'wh3-unit2', name: 'Unit 2', description: 'Conveyor and sorting systems' },
        { id: 'wh3-unit3', name: 'Unit 3', description: 'Order staging and preparation' }
      ]
    }
  ];

  const toggleDropdown = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const closeDropdowns = () => {
    setActiveDropdown(null);
  };

  const handleOrgUnitAndMapSelect = (orgUnit, unit) => {
    if (onOrgUnitSelect) {
      onOrgUnitSelect({ orgUnit, status: { id: 'operational', name: 'Operational' } });
    }
    if (onOrgMapSelect) {
      onOrgMapSelect(unit);
    }
    closeDropdowns();
  };

  const getDropdownLabel = () => {
    if (selectedOrgUnit && selectedOrgMap) {
      return `${selectedOrgUnit.name} • ${selectedOrgMap.name}`;
    }
    if (selectedOrgUnit) {
      return selectedOrgUnit.name;
    }
    return 'Select Org Unit';
  };

  return (
    <nav className="modern-navbar" onClick={closeDropdowns}>
      {/* Left Section - Brand & Selectors */}
      <div className="navbar-left">
        <div 
          className="brand-section" 
          onClick={onNavigateToDashboard}
          style={{ cursor: 'pointer' }}
          title="Go to Home Screen"
        >
          <div className="brand-icon">🏭</div>
          <div className="brand-text">
            <div className="brand-title">WorCoor</div>
            <div className="brand-subtitle">Warehouse Designer</div>
          </div>
        </div>
        
        <div className="selector-group">
          {/* Org Unit Selector */}
          <div className="selector-item">
            <button 
              className="modern-selector"
              onClick={(e) => { e.stopPropagation(); toggleDropdown('orgUnit'); }}
            >
              <span className="selector-label">Org Unit</span>
              <span className="selector-value">{getDropdownLabel()}</span>
              <span className="selector-arrow">▼</span>
            </button>
            {activeDropdown === 'orgUnit' && (
              <div className="modern-dropdown">
                {orgHierarchy.map(org => (
                  <div key={org.id} className="dropdown-group">
                    <div className="dropdown-group-header">
                      <div className="group-title">{org.name}</div>
                      <div className="group-subtitle">{org.location}</div>
                    </div>
                    <div className="dropdown-group-options">
                      {org.units.map(unit => {
                        const isSelected = selectedOrgUnit?.id === org.id && selectedOrgMap?.id === unit.id;
                        return (
                          <button
                            key={unit.id}
                            className={`dropdown-option ${isSelected ? 'selected' : ''}`}
                            onClick={() => handleOrgUnitAndMapSelect(org, unit)}
                          >
                            <span className="option-text">{unit.name}</span>
                            <span className="option-meta">{unit.description}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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
                <div className="dropdown-separator"></div>
                <button onClick={() => { onZoomReset(); closeDropdowns(); }} className="action-option">
                  <span className="option-icon">🎯</span>
                  <span>Reset to Center</span>
                </button>
                <button onClick={() => { onZoomFit(); closeDropdowns(); }} className="action-option">
                  <span className="option-icon">🔲</span>
                  <span>Fit to View</span>
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
