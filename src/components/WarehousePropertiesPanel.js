import React, { useState, useEffect } from 'react';

const WarehousePropertiesPanel = ({ 
  selectedItem, 
  onUpdateItem, 
  onClose,
  isVisible 
}) => {
  const [properties, setProperties] = useState({});

  useEffect(() => {
    if (selectedItem) {
      setProperties({
        name: selectedItem.name || '',
        label: selectedItem.label || '',
        locationTag: selectedItem.locationTag || '',
        type: selectedItem.type || '',
        color: selectedItem.color || '#00BCD4',
        width: selectedItem.width || 0,
        height: selectedItem.height || 0,
        capacity: selectedItem.capacity || 0,
        access: selectedItem.access || 'Forklift Compatible',
        units: selectedItem.units || 0
      });
    }
  }, [selectedItem]);

  if (!isVisible || !selectedItem) return null;

  const panelStyle = {
    position: 'fixed',
    right: '0',
    top: '60px', // Below toolbar
    width: '300px',
    height: 'calc(100vh - 60px)',
    backgroundColor: '#f8f9fa',
    borderLeft: '1px solid #dee2e6',
    padding: '16px',
    fontFamily: 'Arial, sans-serif',
    fontSize: '14px',
    overflow: 'auto',
    zIndex: 1000
  };

  const headerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    paddingBottom: '8px',
    borderBottom: '2px solid #dee2e6'
  };

  const fieldStyle = {
    marginBottom: '12px'
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '4px',
    fontWeight: '500',
    color: '#495057'
  };

  const inputStyle = {
    width: '100%',
    padding: '6px 8px',
    border: '1px solid #ced4da',
    borderRadius: '4px',
    fontSize: '13px'
  };

  const buttonStyle = {
    padding: '8px 16px',
    border: '1px solid #007bff',
    borderRadius: '4px',
    backgroundColor: '#007bff',
    color: 'white',
    cursor: 'pointer',
    fontSize: '13px',
    marginRight: '8px'
  };

  const handlePropertyChange = (key, value) => {
    const newProperties = { ...properties, [key]: value };
    setProperties(newProperties);
  };

  const handleSave = () => {
    onUpdateItem(selectedItem.id, properties);
  };

  const isZone = selectedItem.containerLevel === 2;
  const isUnit = selectedItem.containerLevel === 3;

  return (
    <div style={panelStyle}>
      <div style={headerStyle}>
        <h3 style={{ margin: 0, fontSize: '16px' }}>Properties</h3>
        <button 
          onClick={onClose}
          style={{ 
            background: 'none', 
            border: 'none', 
            fontSize: '18px', 
            cursor: 'pointer' 
          }}
        >
          ×
        </button>
      </div>

      <div style={{ marginBottom: '16px', padding: '8px', backgroundColor: '#e9ecef', borderRadius: '4px' }}>
        <strong>Selected: {selectedItem.name}</strong>
        <br />
        <small style={{ color: '#6c757d' }}>
          {isZone ? 'Zone Container' : isUnit ? 'Storage Unit' : 'Item'}
        </small>
      </div>

      {/* Basic Properties */}
      <div style={fieldStyle}>
        <label style={labelStyle}>Name:</label>
        <input
          type="text"
          value={properties.name}
          onChange={(e) => handlePropertyChange('name', e.target.value)}
          style={inputStyle}
        />
      </div>

      {/* Component Labeling - Enhanced */}
      <div style={{ ...fieldStyle, backgroundColor: '#fff3cd', padding: '8px', borderRadius: '4px', border: '1px solid #ffeaa7' }}>
        <label style={{ ...labelStyle, color: '#856404', fontWeight: 'bold' }}>Display Name/Label:</label>
        <input
          type="text"
          value={properties.label}
          onChange={(e) => handlePropertyChange('label', e.target.value)}
          style={{ ...inputStyle, borderColor: '#ffc107', backgroundColor: '#fff' }}
          placeholder="Enter display name (e.g., Zone A, Rack 01, Storage Unit 1)"
        />
        <small style={{ color: '#856404', fontSize: '11px', fontWeight: '500' }}>
          ✨ This name will be displayed below the component in both layout builder and operational view
        </small>
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Location Tag:</label>
        <input
          type="text"
          value={properties.locationTag}
          onChange={(e) => handlePropertyChange('locationTag', e.target.value)}
          style={inputStyle}
          placeholder="e.g., RM-1, ZONE-A, BAY-01"
        />
        <small style={{ color: '#6c757d', fontSize: '11px' }}>
          Unique location identifier for search and tracking
        </small>
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Type:</label>
        <select
          value={properties.type}
          onChange={(e) => handlePropertyChange('type', e.target.value)}
          style={inputStyle}
        >
          {isZone && (
            <>
              <option value="storage">Primary Storage</option>
              <option value="receiving">Receiving Area</option>
              <option value="dispatch">Dispatch Area</option>
              <option value="office">Office Space</option>
              <option value="transit">Transit Area</option>
            </>
          )}
          {isUnit && (
            <>
              <option value="storage_bay">Storage Bay</option>
              <option value="pallet_position">Pallet Position</option>
              <option value="shelf_unit">Shelf Unit</option>
              <option value="equipment_space">Equipment Space</option>
            </>
          )}
        </select>
      </div>

      <div style={fieldStyle}>
        <label style={labelStyle}>Color:</label>
        <input
          type="color"
          value={properties.color}
          onChange={(e) => handlePropertyChange('color', e.target.value)}
          style={{ ...inputStyle, height: '32px' }}
        />
      </div>

      {/* Dimensions */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Width:</label>
          <input
            type="number"
            value={properties.width}
            onChange={(e) => handlePropertyChange('width', parseInt(e.target.value))}
            style={inputStyle}
          />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Height:</label>
          <input
            type="number"
            value={properties.height}
            onChange={(e) => handlePropertyChange('height', parseInt(e.target.value))}
            style={inputStyle}
          />
        </div>
      </div>

      {/* Zone-specific properties */}
      {isZone && (
        <>
          <div style={fieldStyle}>
            <label style={labelStyle}>Units:</label>
            <input
              type="number"
              value={properties.units}
              readOnly
              style={{ ...inputStyle, backgroundColor: '#e9ecef' }}
            />
            <small style={{ color: '#6c757d' }}>Current unit count</small>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Access Type:</label>
            <select
              value={properties.access}
              onChange={(e) => handlePropertyChange('access', e.target.value)}
              style={inputStyle}
            >
              <option value="Forklift Compatible">Forklift Compatible</option>
              <option value="Manual Access">Manual Access</option>
              <option value="Automated System">Automated System</option>
              <option value="Restricted Access">Restricted Access</option>
            </select>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Capacity:</label>
            <input
              type="number"
              value={properties.capacity}
              onChange={(e) => handlePropertyChange('capacity', parseInt(e.target.value))}
              style={inputStyle}
            />
            <small style={{ color: '#6c757d' }}>Maximum storage units</small>
          </div>
        </>
      )}

      {/* Unit-specific properties */}
      {isUnit && (
        <>
          <div style={fieldStyle}>
            <label style={labelStyle}>Status:</label>
            <select
              value={properties.status || 'available'}
              onChange={(e) => handlePropertyChange('status', e.target.value)}
              style={inputStyle}
            >
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="reserved">Reserved</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>

          <div style={fieldStyle}>
            <label style={labelStyle}>Load Capacity (kg):</label>
            <input
              type="number"
              value={properties.loadCapacity || 1000}
              onChange={(e) => handlePropertyChange('loadCapacity', parseInt(e.target.value))}
              style={inputStyle}
            />
          </div>
        </>
      )}

      {/* Action Buttons */}
      <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #dee2e6' }}>
        <button onClick={handleSave} style={buttonStyle}>
          Apply Changes
        </button>
        <button 
          onClick={onClose}
          style={{ 
            ...buttonStyle, 
            backgroundColor: '#6c757d', 
            borderColor: '#6c757d' 
          }}
        >
          Cancel
        </button>
      </div>

      {/* Zone Actions */}
      {isZone && (
        <div style={{ marginTop: '16px' }}>
          <h4 style={{ fontSize: '14px', marginBottom: '8px' }}>Zone Actions</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <button style={{ 
              ...buttonStyle, 
              backgroundColor: '#28a745', 
              borderColor: '#28a745',
              width: '100%',
              margin: 0
            }}>
              Fill with Units
            </button>
            <button style={{ 
              ...buttonStyle, 
              backgroundColor: '#ffc107', 
              borderColor: '#ffc107',
              color: '#212529',
              width: '100%',
              margin: 0
            }}>
              Clear All Units
            </button>
            <button style={{ 
              ...buttonStyle, 
              backgroundColor: '#dc3545', 
              borderColor: '#dc3545',
              width: '100%',
              margin: 0
            }}>
              Delete Zone
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WarehousePropertiesPanel;
