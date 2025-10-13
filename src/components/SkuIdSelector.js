import React, { useState, useEffect } from 'react';

const SkuIdSelector = ({ isVisible, onClose, onSave, existingSkuIds = [] }) => {
  const [selectedSkuId, setSelectedSkuId] = useState('');
  const [customSkuId, setCustomSkuId] = useState('');
  const [useCustom, setUseCustom] = useState(false);

  // Generate available SKU IDs (001-999)
  const generateAvailableSkuIds = () => {
    const allIds = [];
    for (let i = 1; i <= 999; i++) {
      const skuId = `SKU ID ${i.toString().padStart(3, '0')}`;
      if (!existingSkuIds.includes(skuId)) {
        allIds.push(skuId);
      }
    }
    return allIds;
  };

  const availableSkuIds = generateAvailableSkuIds();

  useEffect(() => {
    if (availableSkuIds.length > 0) {
      setSelectedSkuId(availableSkuIds[0]);
    }
  }, [availableSkuIds.length]);

  const handleSave = () => {
    const finalSkuId = useCustom ? customSkuId.trim() : selectedSkuId;
    
    if (!finalSkuId) {
      alert('Please select or enter a SKU ID');
      return;
    }

    if (existingSkuIds.includes(finalSkuId)) {
      alert('This SKU ID is already in use. Please select a different one.');
      return;
    }

    onSave(finalSkuId);
  };

  const handleClose = () => {
    setSelectedSkuId('');
    setCustomSkuId('');
    setUseCustom(false);
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content sku-id-selector" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Select SKU ID</h3>
          <button className="modal-close" onClick={handleClose}>×</button>
        </div>
        
        <div className="modal-body">
          <div className="sku-id-options">
            <div className="sku-option">
              <label>
                <input
                  type="radio"
                  checked={!useCustom}
                  onChange={() => setUseCustom(false)}
                />
                <span>Select from available IDs</span>
              </label>
              
              {!useCustom && (
                <div className="sku-dropdown-container">
                  <select
                    value={selectedSkuId}
                    onChange={(e) => setSelectedSkuId(e.target.value)}
                    className="sku-dropdown"
                  >
                    {availableSkuIds.slice(0, 50).map(skuId => (
                      <option key={skuId} value={skuId}>
                        {skuId}
                      </option>
                    ))}
                  </select>
                  <div className="sku-info">
                    {availableSkuIds.length > 50 && (
                      <small>Showing first 50 of {availableSkuIds.length} available IDs</small>
                    )}
                    {availableSkuIds.length === 0 && (
                      <small style={{ color: '#f44336' }}>No available sequential IDs. Use custom ID.</small>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="sku-option">
              <label>
                <input
                  type="radio"
                  checked={useCustom}
                  onChange={() => setUseCustom(true)}
                />
                <span>Enter custom SKU ID</span>
              </label>
              
              {useCustom && (
                <div className="custom-sku-container">
                  <input
                    type="text"
                    value={customSkuId}
                    onChange={(e) => setCustomSkuId(e.target.value)}
                    placeholder="Enter custom SKU ID (e.g., CUSTOM-001)"
                    className="custom-sku-input"
                    maxLength={20}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="existing-skus-info">
            <small>
              <strong>Used SKU IDs:</strong> {existingSkuIds.length} 
              {existingSkuIds.length > 0 && (
                <span> (Latest: {existingSkuIds[existingSkuIds.length - 1]})</span>
              )}
            </small>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={handleClose}>
            Cancel
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleSave}
            disabled={!useCustom && !selectedSkuId || useCustom && !customSkuId.trim()}
          >
            Add SKU
          </button>
        </div>
      </div>
    </div>
  );
};

export default SkuIdSelector;
