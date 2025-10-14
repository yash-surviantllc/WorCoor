import React, { useState } from 'react';

const TopNavbar = ({
  // Layout Info
  layoutName,
  selectedOrgUnit,
  onOrgUnitSelect,
  
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
  
  // Status
  itemCount
}) => {
  const [activeDropdown, setActiveDropdown] = useState(null);

  // Organizational Units
  const orgUnits = [
    { id: 'warehouse-1', name: 'Warehouse 1', location: 'Building A' },
    { id: 'warehouse-2', name: 'Warehouse 2', location: 'Building B' },
    { id: 'warehouse-3', name: 'Warehouse 3', location: 'Building C' },
    { id: 'distribution-center-1', name: 'Distribution Center 1', location: 'Building D' },
    { id: 'distribution-center-2', name: 'Distribution Center 2', location: 'Building E' },
    { id: 'cold-storage-1', name: 'Cold Storage 1', location: 'Building F' },
    { id: 'cold-storage-2', name: 'Cold Storage 2', location: 'Building G' },
    { id: 'processing-facility', name: 'Processing Facility', location: 'Building H' },
    { id: 'returns-center', name: 'Returns Center', location: 'Building I' },
    { id: 'cross-dock', name: 'Cross Dock', location: 'Building J' }
  ];

  const toggleDropdown = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const closeDropdowns = () => {
    setActiveDropdown(null);
  };

  const handleOrgUnitChange = (orgUnit) => {
    if (onOrgUnitSelect) {
      onOrgUnitSelect({ orgUnit, status: { id: 'operational', name: 'Operational' } });
    }
    closeDropdowns();
  };

  return (
    <nav className="top-navbar" onClick={closeDropdowns}>
      <div className="navbar-brand">
        <div className="org-unit-selector">
          <div className="org-unit-label">Select Org Unit</div>
          <div className="dropdown-container">
            <button 
              className="org-unit-dropdown-toggle"
              onClick={(e) => { e.stopPropagation(); toggleDropdown('orgUnit'); }}
            >
              <span className="org-unit-icon">🏭</span>
              <div className="org-unit-info">
                <div className="org-unit-name">
                  {selectedOrgUnit ? selectedOrgUnit.name : 'Warehouse Management System'}
                </div>
                <div className="org-unit-subtitle">
                  {selectedOrgUnit 
                    ? `${selectedOrgUnit.location} - Layout Designer`
                    : itemCount > 0 
                      ? 'Professional Layout Designer' 
                      : 'Professional Layout Designer - Start by adding components'}
                </div>
              </div>
              <span className="dropdown-arrow">▼</span>
            </button>
            {activeDropdown === 'orgUnit' && (
              <div className="dropdown-menu org-unit-menu">
                <div className="dropdown-header">Select Organizational Unit</div>
                {orgUnits.map(unit => (
                  <button 
                    key={unit.id}
                    className={`org-unit-option ${selectedOrgUnit?.id === unit.id ? 'selected' : ''}`}
                    onClick={() => handleOrgUnitChange(unit)}
                  >
                    <div className="org-unit-option-name">{unit.name}</div>
                    <div className="org-unit-option-location">{unit.location}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="navbar-content">
        {/* File Menu */}
        <div className="navbar-section">
          <div className="dropdown-container">
            <button 
              className="navbar-btn dropdown-toggle"
              onClick={(e) => { e.stopPropagation(); toggleDropdown('file'); }}
            >
              📁 File
            </button>
            {activeDropdown === 'file' && (
              <div className="dropdown-menu">
                <button onClick={onSave}>💾 Save Layout</button>
                <div className="dropdown-divider"></div>
                <button onClick={() => onExportLayout('png')}>🖼️ Export PNG</button>
                <button onClick={() => onExportLayout('svg')}>📊 Export SVG</button>
                <button onClick={() => onExportLayout('pdf')}>📄 Export PDF</button>
                <div className="dropdown-divider"></div>
                <button onClick={onClear} className="danger">🗑️ Clear All</button>
              </div>
            )}
          </div>
        </div>

        {/* Tools Menu */}
        <div className="navbar-section">
          <div className="dropdown-container">
            <button 
              className="navbar-btn dropdown-toggle"
              onClick={(e) => { e.stopPropagation(); toggleDropdown('tools'); }}
            >
              🔧 Tools
            </button>
            {activeDropdown === 'tools' && (
              <div className="dropdown-menu">
                <button onClick={onFacilityManager}>🏢 Facility Manager</button>
                <div className="dropdown-divider"></div>
                <button onClick={onSearch}>🔍 Search Items</button>
              </div>
            )}
          </div>
        </div>

        {/* View Menu */}
        <div className="navbar-section">
          <div className="dropdown-container">
            <button 
              className="navbar-btn dropdown-toggle"
              onClick={(e) => { e.stopPropagation(); toggleDropdown('view'); }}
            >
              👁️ View
            </button>
            {activeDropdown === 'view' && (
              <div className="dropdown-menu">
                <button 
                  onClick={onToggleGrid}
                  className={gridVisible ? 'active' : ''}
                >
                  ⊞ {gridVisible ? 'Hide' : 'Show'} Grid
                </button>
                <button 
                  onClick={onToggleSnap}
                  className={snapEnabled ? 'active' : ''}
                >
                  🧲 {snapEnabled ? 'Disable' : 'Enable'} Snap
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Edit Menu */}
        <div className="navbar-section">
          <button 
            className={`navbar-btn ${!canUndo ? 'disabled' : ''}`}
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo"
          >
            ↶
          </button>
          <button 
            className={`navbar-btn ${!canRedo ? 'disabled' : ''}`}
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo"
          >
            ↷
          </button>
        </div>


        {/* Status Info */}
        <div className="navbar-section status-section">
          <div className="status-info">
            <span className="item-count">{itemCount} items</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="navbar-section quick-actions">
          {/* Stack mode toggle removed */}
        </div>
      </div>

    </nav>
  );
};

export default TopNavbar;
