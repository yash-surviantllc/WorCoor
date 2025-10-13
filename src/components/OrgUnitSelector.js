import React, { useState } from 'react';

const OrgUnitSelector = ({ isVisible, onClose, onSave }) => {
  const [selectedOrgUnit, setSelectedOrgUnit] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Organizational Units based on your image
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

  const statusOptions = [
    { id: 'operational', name: 'Operational', description: 'Ready for live operations' },
    { id: 'offline', name: 'Offline', description: 'Not currently in use' },
    { id: 'maintenance', name: 'Maintenance', description: 'Under maintenance/construction' },
    { id: 'planning', name: 'Planning', description: 'Still in planning phase' }
  ];

  const handleSave = () => {
    if (!selectedOrgUnit || !selectedStatus) {
      alert('Please select both an organizational unit and operational status.');
      return;
    }

    const selectedUnit = orgUnits.find(unit => unit.id === selectedOrgUnit);
    const selectedStatusObj = statusOptions.find(status => status.id === selectedStatus);

    onSave({
      orgUnit: selectedUnit,
      status: selectedStatusObj
    });

    // Reset form
    setSelectedOrgUnit('');
    setSelectedStatus('');
  };

  const handleCancel = () => {
    setSelectedOrgUnit('');
    setSelectedStatus('');
    onClose();
  };

  if (!isVisible) return null;

  const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    backdropFilter: 'blur(4px)'
  };

  const modalStyle = {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '24px',
    width: '480px',
    maxWidth: '90vw',
    maxHeight: '80vh',
    overflow: 'auto',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    fontFamily: 'Arial, sans-serif'
  };

  const headerStyle = {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#1f2937',
    textAlign: 'center'
  };

  const sectionStyle = {
    marginBottom: '24px'
  };

  const labelStyle = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '8px'
  };

  const selectStyle = {
    width: '100%',
    padding: '10px 12px',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    backgroundColor: '#ffffff',
    color: '#1f2937',
    outline: 'none',
    transition: 'border-color 0.2s ease'
  };

  const buttonContainerStyle = {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    marginTop: '24px'
  };

  const buttonStyle = {
    padding: '10px 20px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: 'none'
  };

  const cancelButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#f3f4f6',
    color: '#374151',
    border: '1px solid #d1d5db'
  };

  const saveButtonStyle = {
    ...buttonStyle,
    backgroundColor: '#2563eb',
    color: '#ffffff'
  };

  const disabledButtonStyle = {
    ...saveButtonStyle,
    backgroundColor: '#9ca3af',
    cursor: 'not-allowed'
  };

  return (
    <div style={modalOverlayStyle} onClick={handleCancel}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          📋 Select Organizational Unit
        </div>

        <div style={sectionStyle}>
          <label style={labelStyle}>
            Organizational Unit *
          </label>
          <select
            style={selectStyle}
            value={selectedOrgUnit}
            onChange={(e) => setSelectedOrgUnit(e.target.value)}
          >
            <option value="">Select an organizational unit...</option>
            {orgUnits.map(unit => (
              <option key={unit.id} value={unit.id}>
                {unit.name} ({unit.location})
              </option>
            ))}
          </select>
        </div>

        <div style={sectionStyle}>
          <label style={labelStyle}>
            Operational Status *
          </label>
          <select
            style={selectStyle}
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="">Select operational status...</option>
            {statusOptions.map(status => (
              <option key={status.id} value={status.id}>
                {status.name} - {status.description}
              </option>
            ))}
          </select>
        </div>

        {selectedOrgUnit && selectedStatus && (
          <div style={{
            backgroundColor: '#f0f9ff',
            border: '1px solid #0ea5e9',
            borderRadius: '6px',
            padding: '12px',
            marginBottom: '16px'
          }}>
            <div style={{ fontSize: '12px', color: '#0369a1', fontWeight: '500' }}>
              Layout will be saved as:
            </div>
            <div style={{ fontSize: '14px', color: '#0c4a6e', fontWeight: '600', marginTop: '4px' }}>
              {orgUnits.find(u => u.id === selectedOrgUnit)?.name} - {statusOptions.find(s => s.id === selectedStatus)?.name}
            </div>
          </div>
        )}

        <div style={buttonContainerStyle}>
          <button
            style={cancelButtonStyle}
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            style={(!selectedOrgUnit || !selectedStatus) ? disabledButtonStyle : saveButtonStyle}
            onClick={handleSave}
            disabled={!selectedOrgUnit || !selectedStatus}
          >
            Save Layout
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrgUnitSelector;
