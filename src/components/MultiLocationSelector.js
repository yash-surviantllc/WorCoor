import React, { useState, useEffect } from 'react';
import '../styles/MultiLocationSelector.css';
import showMessage from '../utils/showMessage';

const MultiLocationSelector = ({ isVisible, onClose, onSave, existingLocationIds = [], itemType = '', initialLevelIds = [] }) => {
  const [selectedLevelId, setSelectedLevelId] = useState('');
  const [selectedLocId, setSelectedLocId] = useState('');
  const [attachedLevelIds, setAttachedLevelIds] = useState([]);

  // Check if this is for vertical storage rack
  const isVerticalStorageRack = itemType === 'vertical_sku_holder';

  // Generate available Level IDs (L1, L2, L3...)
  const generateAvailableLevelIds = () => {
    const allIds = [];
    for (let i = 1; i <= 999; i++) {
      allIds.push(`L${i}`);
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

  const availableLevelIds = generateAvailableLevelIds().filter(id => !attachedLevelIds.includes(id));
  const availableLocIds = generateAvailableLocIds(selectedLevelId);

  useEffect(() => {
    if (isVisible) {
      const seededIds = Array.isArray(initialLevelIds) ? [...initialLevelIds] : [];
      setAttachedLevelIds(seededIds);
      const nextAvailable = generateAvailableLevelIds().find(id => !seededIds.includes(id)) || '';
      setSelectedLevelId(nextAvailable);
    }
  }, [isVisible, initialLevelIds]);

  useEffect(() => {
    if (!selectedLevelId && availableLevelIds.length > 0) {
      setSelectedLevelId(availableLevelIds[0]);
      return;
    }

    if (selectedLevelId && !availableLevelIds.includes(selectedLevelId)) {
      setSelectedLevelId(availableLevelIds[0] || '');
      return;
    }

    if (availableLevelIds.length === 0) {
      setSelectedLevelId('');
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
    if (attachedLevelIds.length === 0) {
      showMessage.warning('Attach at least one Level ID before saving');
      return;
    }

    // Return both IDs as multiple location format
    const result = {
      locationIds: attachedLevelIds,
      tags: attachedLevelIds.map((levelId, index) => `Level ${index + 1}`),
      category: 'storage', // Default category for storage racks
      isMultiple: true
    };
    
    onSave(result);
  };

  const handleClose = () => {
    setSelectedLevelId('');
    setSelectedLocId('');
    setAttachedLevelIds([]);
    onClose();
  };

  const handleAttachLevelId = () => {
    if (!selectedLevelId) {
      showMessage.warning('Please select a Level ID to attach');
      return;
    }

    if (attachedLevelIds.includes(selectedLevelId)) {
      showMessage.warning(`${selectedLevelId} is already attached to this block`);
      return;
    }

    setAttachedLevelIds(prev => {
      const updated = [...prev, selectedLevelId];
      const nextAvailable = generateAvailableLevelIds().find(id => !updated.includes(id)) || '';
      setSelectedLevelId(nextAvailable);
      return updated;
    });
    showMessage.success(`${selectedLevelId} attached to this block`);
  };

  const handleRemoveAttachedLevelId = (levelId) => {
    setAttachedLevelIds(prev => {
      const updated = prev.filter(id => id !== levelId);
      const nextAvailable = generateAvailableLevelIds().find(id => !updated.includes(id)) || '';
      setSelectedLevelId(nextAvailable);
      return updated;
    });
    showMessage.info(`${levelId} removed from this block`);
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

          {/* Attach level IDs */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '12px', color: '#333' }}>
              ➕ Attach Level IDs to this Block
            </div>
            <div
              style={{
                padding: '12px',
                backgroundColor: '#f1f8e9',
                borderRadius: '6px',
                border: '1px solid #c5e1a5'
              }}
            >
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
                <select
                  value={selectedLevelId}
                  onChange={(e) => setSelectedLevelId(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    border: '1px solid #8bc34a',
                    borderRadius: '4px',
                    fontSize: '0.9em',
                    backgroundColor: 'white'
                  }}
                  disabled={availableLevelIds.length === 0}
                >
                  {availableLevelIds.length === 0 ? (
                    <option value="">
                      All levels attached
                    </option>
                  ) : (
                    availableLevelIds.slice(0, 50).map(levelId => (
                      <option key={levelId} value={levelId}>
                        {levelId}
                      </option>
                    ))
                  )}
                </select>
                <button
                  type="button"
                  onClick={handleAttachLevelId}
                  className="btn btn-primary"
                  style={{ padding: '8px 16px' }}
                  disabled={!selectedLevelId}
                >
                  Attach ID
                </button>
              </div>

              {attachedLevelIds.length === 0 ? (
                <div style={{ fontSize: '0.85em', color: '#689f38' }}>
                  No level IDs attached yet. Select a level and click "Attach ID" to add it.
                </div>
              ) : (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {attachedLevelIds.map(levelId => (
                    <div
                      key={levelId}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 10px',
                        backgroundColor: '#dcedc8',
                        borderRadius: '16px',
                        border: '1px solid #aed581',
                        fontSize: '0.85em'
                      }}
                    >
                      <span style={{ fontWeight: '600', color: '#33691e' }}>{levelId}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachedLevelId(levelId)}
                        style={{
                          border: 'none',
                          background: 'transparent',
                          color: '#2e7d32',
                          cursor: 'pointer',
                          fontWeight: 'bold'
                        }}
                        title={`Remove ${levelId}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Location selection temporarily disabled */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontWeight: 'bold', marginBottom: '12px', color: '#333' }}>
              📍 Location ID Selection (Temporarily Disabled)
            </div>
            <div
              style={{
                padding: '12px',
                backgroundColor: '#fff8e1',
                borderRadius: '6px',
                border: '1px dashed #ffb300',
                color: '#bf6f00',
                fontSize: '0.85em'
              }}
            >
              Location ID dropdown is disabled for this flow. Attach the level IDs below to reserve multiple heights for this block.
            </div>
          </div>


          <div style={{ marginTop: '16px', fontSize: '0.8em', color: '#666' }}>
            <strong>Current block level IDs:</strong> {attachedLevelIds.length > 0 ? attachedLevelIds.join(', ') : 'None'}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={handleClose}>
            Cancel
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleSave}
            disabled={attachedLevelIds.length === 0}
          >
            Save Level IDs
          </button>
        </div>
      </div>
    </div>
  );
};

export default MultiLocationSelector;
