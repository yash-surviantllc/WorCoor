import React, { useState, useEffect } from 'react';
import '../styles/MultiLocationSelector.css';
import showMessage from '../utils/showMessage';

const MultiLocationSelector = ({ isVisible, onClose, onSave, existingLocationIds = [], itemType = '' }) => {
  const [selectedLevelId, setSelectedLevelId] = useState('');
  const [selectedLocId, setSelectedLocId] = useState('');

  // Check if this is for vertical storage rack
  const isVerticalStorageRack = itemType === 'vertical_sku_holder';

  // Generate available Level IDs (L1, L2, L3...)
  const generateAvailableLevelIds = () => {
    const allIds = [];
    for (let i = 1; i <= 999; i++) {
      const levelId = `L${i}`;
      if (!existingLocationIds.includes(levelId)) {
        allIds.push(levelId);
      }
    }
    return allIds;
  };

  // Generate available Location IDs with Level prefix (e.g., L1-Loc01)
  const generateAvailableLocIds = (levelId) => {
    if (!levelId) {
      return [];
    }

    const allIds = [];
    for (let i = 1; i <= 999; i++) {
      const locId = `${levelId}-Loc${i.toString().padStart(2, '0')}`;
      if (!existingLocationIds.includes(locId)) {
        allIds.push(locId);
      }
    }
    return allIds;
  };

  const availableLevelIds = generateAvailableLevelIds();
  const availableLocIds = generateAvailableLocIds(selectedLevelId);

  useEffect(() => {
    if (!selectedLevelId && availableLevelIds.length > 0) {
      setSelectedLevelId(availableLevelIds[0]);
    }
  }, [availableLevelIds, selectedLevelId]);

  useEffect(() => {
    if (!selectedLevelId) {
      setSelectedLocId('');
      return;
    }

    const locOptions = generateAvailableLocIds(selectedLevelId);
    if (locOptions.length === 0) {
      setSelectedLocId('');
      return;
    }

    if (!locOptions.includes(selectedLocId)) {
      setSelectedLocId(locOptions[0]);
    }
  }, [selectedLevelId, existingLocationIds]);


  const handleSave = () => {
    // Validate selections
    if (!selectedLevelId.trim() || !selectedLocId.trim()) {
      showMessage.warning('Please select both Level ID and Location ID');
      return;
    }

    // Check if either ID is already in use
    if (existingLocationIds.includes(selectedLevelId)) {
      showMessage.error(`Level ID ${selectedLevelId} is already in use. Please select a different one.`);
      return;
    }

    if (existingLocationIds.includes(selectedLocId)) {
      showMessage.error(`Location ID ${selectedLocId} is already in use. Please select a different one.`);
      return;
    }

    // Return both IDs as multiple location format
    const result = {
      locationIds: [selectedLevelId, selectedLocId],
      tags: ['Level', 'Location'],
      category: 'storage', // Default category for storage racks
      isMultiple: true
    };
    
    onSave(result);
  };

  const handleClose = () => {
    setSelectedLevelId('');
    setSelectedLocId('');
    onClose();
  };

  if (!isVisible) return null;

  console.log('MultiLocationSelector rendering with:', { 
    isVisible, 
    itemType, 
    isVerticalStorageRack,
    selectedLevelId,
    selectedLocId,
    availableLevelIds: availableLevelIds.slice(0, 5),
    availableLocIds: availableLocIds.slice(0, 5)
  }); // Debug log

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content multi-location-selector" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>
            {isVerticalStorageRack ? 'Multiple Location IDs & Tags' : 'Location ID Selection'}
            {isVerticalStorageRack && <span style={{ color: '#FF5722', fontSize: '0.9em' }}> (Vertical Storage Rack)</span>}
          </h3>
          <button className="modal-close" onClick={handleClose}>×</button>
        </div>
        
        <div className="modal-body">
          {isVerticalStorageRack && (
            <div style={{ 
              backgroundColor: '#fff3e0', 
              padding: '12px', 
              borderRadius: '6px', 
              marginBottom: '16px',
              border: '1px solid #ff9800'
            }}>
              <div style={{ fontWeight: 'bold', color: '#e65100', marginBottom: '4px' }}>
                📐 Vertical Storage Rack - Multi-Level Storage:
              </div>
              <div style={{ fontSize: '0.9em', color: '#bf360c' }}>
                • Select Level ID (L1, L2, L3...) for vertical positioning
                • Select Location ID (LOC-001, LOC-002...) for inventory tracking
              </div>
            </div>
          )}

          {/* Level ID Dropdown */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '12px', color: '#333' }}>
              🏗️ Level ID (L1, L2, L3...):
            </div>
            <div style={{ 
              padding: '12px',
              backgroundColor: '#f8f9fa',
              borderRadius: '6px',
              border: '1px solid #dee2e6'
            }}>
              <select
                value={selectedLevelId}
                onChange={(e) => setSelectedLevelId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '0.9em',
                  backgroundColor: 'white'
                }}
              >
                {availableLevelIds.slice(0, 50).map(levelId => (
                  <option key={levelId} value={levelId}>
                    {levelId}
                  </option>
                ))}
              </select>
              <div style={{ fontSize: '0.8em', color: '#666', marginTop: '8px' }}>
                Select the vertical level for storage (L1=bottom, L2=middle, L3=top, etc.)
              </div>
            </div>
          </div>

          {/* Location ID Dropdown */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '12px', color: '#333' }}>
              📍 Location ID ({selectedLevelId ? `${selectedLevelId}-Loc01` : 'Lx-Loc01'}...):
            </div>
            <div style={{ 
              padding: '12px',
              backgroundColor: '#f8f9fa',
              borderRadius: '6px',
              border: '1px solid #dee2e6'
            }}>
              <select
                value={selectedLocId}
                onChange={(e) => setSelectedLocId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '0.9em',
                  backgroundColor: 'white'
                }}
              >
                {availableLocIds.slice(0, 50).map(locId => (
                  <option key={locId} value={locId}>
                    {locId}
                  </option>
                ))}
              </select>
              <div style={{ fontSize: '0.8em', color: '#666', marginTop: '8px' }}>
                Select the location slot for this level (e.g., {selectedLevelId ? `${selectedLevelId}-Loc01` : 'Lx-Loc01'})
              </div>
            </div>
          </div>


          <div style={{ marginTop: '16px', fontSize: '0.8em', color: '#666' }}>
            <strong>Used Location IDs:</strong> {existingLocationIds.length}
            {existingLocationIds.length > 0 && (
              <span> (Latest: {existingLocationIds[existingLocationIds.length - 1]})</span>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={handleClose}>
            Cancel
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleSave}
            disabled={!selectedLevelId.trim() || !selectedLocId.trim()}
          >
            Add Location IDs
          </button>
        </div>
      </div>
    </div>
  );
};

export default MultiLocationSelector;
