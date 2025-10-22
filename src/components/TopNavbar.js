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

  // Organization Mapping - Dedicated maps per unit
  const organizationMaps = {
    'warehouse-1': [
      { id: 'wh1-main', name: 'Main Floor Plan', type: 'primary', description: 'Primary storage and operations area' },
      { id: 'wh1-mezzanine', name: 'Mezzanine Level', type: 'secondary', description: 'Upper level storage and offices' },
      { id: 'wh1-loading', name: 'Loading Dock Area', type: 'specialized', description: 'Truck loading and receiving zones' },
      { id: 'wh1-cold', name: 'Cold Storage Section', type: 'specialized', description: 'Temperature-controlled storage' }
    ],
    'warehouse-2': [
      { id: 'wh2-main', name: 'Main Operations Floor', type: 'primary', description: 'Central processing and storage' },
      { id: 'wh2-assembly', name: 'Assembly Area', type: 'specialized', description: 'Product assembly and packaging' },
      { id: 'wh2-quality', name: 'Quality Control Zone', type: 'specialized', description: 'Inspection and testing area' },
      { id: 'wh2-returns', name: 'Returns Processing', type: 'secondary', description: 'Returns handling and sorting' }
    ],
    'warehouse-3': [
      { id: 'wh3-main', name: 'Distribution Center', type: 'primary', description: 'Main distribution operations' },
      { id: 'wh3-sorting', name: 'Automated Sorting', type: 'specialized', description: 'Conveyor and sorting systems' },
      { id: 'wh3-staging', name: 'Staging Area', type: 'secondary', description: 'Order staging and preparation' }
    ],
    'distribution-center-1': [
      { id: 'dc1-inbound', name: 'Inbound Processing', type: 'primary', description: 'Receiving and intake operations' },
      { id: 'dc1-storage', name: 'Bulk Storage', type: 'primary', description: 'High-density storage systems' },
      { id: 'dc1-outbound', name: 'Outbound Fulfillment', type: 'primary', description: 'Order picking and shipping' },
      { id: 'dc1-cross-dock', name: 'Cross-Dock Operations', type: 'specialized', description: 'Direct transfer operations' }
    ],
    'distribution-center-2': [
      { id: 'dc2-main', name: 'Main Distribution Floor', type: 'primary', description: 'Primary distribution operations' },
      { id: 'dc2-express', name: 'Express Fulfillment', type: 'specialized', description: 'Fast-track order processing' },
      { id: 'dc2-bulk', name: 'Bulk Handling', type: 'secondary', description: 'Large item processing' }
    ],
    'cold-storage-1': [
      { id: 'cs1-freezer', name: 'Freezer Section (-25°C)', type: 'primary', description: 'Deep freeze storage' },
      { id: 'cs1-chilled', name: 'Chilled Section (2-8°C)', type: 'primary', description: 'Refrigerated storage' },
      { id: 'cs1-staging', name: 'Temperature Staging', type: 'secondary', description: 'Temperature transition area' }
    ],
    'cold-storage-2': [
      { id: 'cs2-main', name: 'Main Cold Storage', type: 'primary', description: 'Primary refrigerated area' },
      { id: 'cs2-produce', name: 'Fresh Produce Section', type: 'specialized', description: 'Optimized for fresh goods' },
      { id: 'cs2-pharma', name: 'Pharmaceutical Storage', type: 'specialized', description: 'Medical-grade cold storage' }
    ],
    'processing-facility': [
      { id: 'pf-production', name: 'Production Floor', type: 'primary', description: 'Main manufacturing area' },
      { id: 'pf-packaging', name: 'Packaging Lines', type: 'specialized', description: 'Automated packaging systems' },
      { id: 'pf-quality', name: 'Quality Assurance', type: 'secondary', description: 'Testing and quality control' },
      { id: 'pf-raw', name: 'Raw Materials', type: 'secondary', description: 'Raw material storage' }
    ],
    'returns-center': [
      { id: 'rc-intake', name: 'Returns Intake', type: 'primary', description: 'Initial returns processing' },
      { id: 'rc-inspection', name: 'Inspection Area', type: 'specialized', description: 'Product evaluation and testing' },
      { id: 'rc-refurb', name: 'Refurbishment Zone', type: 'specialized', description: 'Product repair and restoration' },
      { id: 'rc-disposal', name: 'Disposal Processing', type: 'secondary', description: 'Waste and disposal handling' }
    ],
    'cross-dock': [
      { id: 'cd-receiving', name: 'Receiving Docks', type: 'primary', description: 'Inbound truck operations' },
      { id: 'cd-sorting', name: 'Sorting Hub', type: 'primary', description: 'Central sorting operations' },
      { id: 'cd-shipping', name: 'Shipping Docks', type: 'primary', description: 'Outbound truck operations' },
      { id: 'cd-staging', name: 'Staging Areas', type: 'secondary', description: 'Temporary holding zones' }
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
                    <div className="org-unit-option-content">
                      <div className="org-unit-option-name">{unit.name}</div>
                      <div className="org-unit-option-location">{unit.location}</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Organization Mapping Dropdown */}
          {selectedOrgUnit && (
            <div className="org-map-selector">
              <div className="org-map-label">Organization Mapping</div>
              <div className="dropdown-container">
                <button 
                  className="org-map-dropdown-toggle"
                  onClick={(e) => { e.stopPropagation(); toggleDropdown('orgMap'); }}
                >
                  <span className="org-map-icon">🗺️</span>
                  <div className="org-map-info">
                    <div className="org-map-name">
                      {selectedOrgMap ? selectedOrgMap.name : 'Select Map'}
                    </div>
                    <div className="org-map-subtitle">
                      {selectedOrgMap 
                        ? `${selectedOrgMap.type.charAt(0).toUpperCase() + selectedOrgMap.type.slice(1)} Map`
                        : `${getAvailableMaps().length} maps available`}
                    </div>
                  </div>
                  <span className="dropdown-arrow">▼</span>
                </button>
                {activeDropdown === 'orgMap' && (
                  <div className="dropdown-menu org-map-menu">
                    <div className="dropdown-header">
                      Select Map for {selectedOrgUnit.name}
                    </div>
                    
                    {/* Group maps by type */}
                    {['primary', 'specialized', 'secondary'].map(mapType => {
                      const mapsOfType = getAvailableMaps().filter(map => map.type === mapType);
                      if (mapsOfType.length === 0) return null;
                      
                      return (
                        <div key={mapType} className="map-type-group">
                          <div className="map-type-header">
                            <span className="map-type-icon">{getMapTypeIcon(mapType)}</span>
                            <span className="map-type-label">
                              {mapType.charAt(0).toUpperCase() + mapType.slice(1)} Maps
                            </span>
                            <span className="map-type-count">({mapsOfType.length})</span>
                          </div>
                          
                          {mapsOfType.map(map => (
                            <button 
                              key={map.id}
                              className={`org-map-option ${selectedOrgMap?.id === map.id ? 'selected' : ''}`}
                              onClick={() => handleOrgMapChange(map)}
                            >
                              <div className="map-option-icon" style={{ color: getMapTypeColor(map.type) }}>
                                {getMapTypeIcon(map.type)}
                              </div>
                              <div className="map-option-content">
                                <div className="map-option-name">{map.name}</div>
                                <div className="map-option-description">{map.description}</div>
                              </div>
                              <div className="map-type-badge" style={{ backgroundColor: getMapTypeColor(map.type) }}>
                                {map.type}
                              </div>
                            </button>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
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
