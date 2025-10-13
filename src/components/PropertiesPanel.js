import React, { useState, useCallback } from 'react';
import SkuIdSelector from './SkuIdSelector';

const PropertiesPanel = ({ selectedItem, onUpdateItem, onDeleteItem }) => {
  const [skuIdSelectorVisible, setSkuIdSelectorVisible] = useState(false);
  const [pendingCompartmentId, setPendingCompartmentId] = useState(null);

  if (!selectedItem) {
    return (
      <div className="properties-panel animate-slide-right">
        <h3>⚙️ Properties</h3>
        <div style={{ 
          textAlign: 'center', 
          color: 'var(--gray-500)', 
          marginTop: 'var(--spacing-8)',
          fontSize: 'var(--font-size-sm)',
          padding: 'var(--spacing-6)',
          background: 'var(--gray-50)',
          borderRadius: 'var(--radius-lg)',
          border: '2px dashed var(--gray-300)'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: 'var(--spacing-2)' }}>🎯</div>
          <div style={{ fontWeight: '600', marginBottom: 'var(--spacing-1)' }}>No Selection</div>
          <div>Click on any warehouse item to view and edit its properties</div>
        </div>
      </div>
    );
  }

  const handleInputChange = (property, value) => {
    onUpdateItem(selectedItem.id, { [property]: value });
  };

  // Get all existing SKU IDs from the selected item
  const getExistingSkuIds = () => {
    if (!selectedItem.compartmentContents) return [];
    return Object.values(selectedItem.compartmentContents)
      .map(item => item.locationId || item.uniqueId)
      .filter(Boolean);
  };

  // Handle SKU ID selection from dropdown
  const handleSkuIdSelect = (skuId) => {
    if (!pendingCompartmentId) return;
    
    const row = Math.floor(pendingCompartmentId.split('-')[1] / (selectedItem.width / 60));
    const col = pendingCompartmentId.split('-')[1] % (selectedItem.width / 60);
    
    const newContents = { 
      ...selectedItem.compartmentContents, 
      [pendingCompartmentId]: { 
        locationId: skuId,
        uniqueId: skuId, // Keep for backward compatibility
        sku: skuId, // Use the selected SKU ID as the SKU
        quantity: 1,
        status: 'planned',
        category: '',
        storageSpace: `${Math.floor(selectedItem.width / 60)}x${Math.floor(selectedItem.height / 60)}`,
        availability: 'available',
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        position: {
          row: row + 1,
          col: col + 1,
          compartment: pendingCompartmentId
        },
        metadata: {
          weight: null,
          dimensions: null,
          temperature: null,
          hazardous: false,
          priority: 'normal'
        }
      }
    };
    
    onUpdateItem(selectedItem.id, { compartmentContents: newContents });
    setSkuIdSelectorVisible(false);
    setPendingCompartmentId(null);
  };

  const handleSkuIdSelectorClose = () => {
    setSkuIdSelectorVisible(false);
    setPendingCompartmentId(null);
  };

  const handleNumberChange = (property, value) => {
    // Check if the property is locked
    if ((property === 'x' || property === 'y') && selectedItem.isPositionLocked) {
      return; // Don't update position if position is locked
    }
    if ((property === 'width' || property === 'height') && selectedItem.isSizeLocked) {
      return; // Don't update size if size is locked
    }
    
    let numValue = parseInt(value) || 0;
    
    // Handle grid-based positioning for ALL components
    if (property === 'x' || property === 'y') {
      // Determine grid size based on component type and properties
      let gridSize = 15; // Default sub-grid for most components
      
      if (selectedItem.type === 'solid_boundary' || selectedItem.type === 'dotted_boundary') {
        // Boundary components use 15px grid for precise positioning
        gridSize = 15;
      } else if (selectedItem.gridStep) {
        // Use component's specific grid step if defined
        gridSize = selectedItem.gridStep;
      } else if (selectedItem.type === 'square_boundary' || selectedItem.gridAligned) {
        // Use major grid for floor plan components
        gridSize = 60;
      }
      
      // Snap to grid
      numValue = Math.round(numValue / gridSize) * gridSize;
      
      // Ensure minimum position (0 or positive)
      numValue = Math.max(0, numValue);
    }
    
    // Handle grid-based sizing for components with gridStep property
    if ((property === 'width' || property === 'height') && selectedItem.gridStep) {
      const gridStep = selectedItem.gridStep;
      
      // Round to nearest grid step
      numValue = Math.round(numValue / gridStep) * gridStep;
      
      // Ensure minimum size constraints
      if (selectedItem.minSize) {
        const minValue = selectedItem.minSize[property];
        if (minValue && numValue < minValue) {
          numValue = minValue;
        }
      }
      
      // Ensure maximum size constraints
      if (selectedItem.maxSize) {
        const maxValue = selectedItem.maxSize[property];
        if (maxValue && numValue > maxValue) {
          numValue = maxValue;
        }
      }
      
      // Ensure minimum grid step
      if (numValue < gridStep) {
        numValue = gridStep;
      }
    }
    
    if (numValue >= 0) {
      onUpdateItem(selectedItem.id, { [property]: numValue });
    }
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      onDeleteItem(selectedItem.id);
    }
  };

  return (
    <div className="properties-panel animate-slide-right">
      <h3>⚙️ Properties</h3>
      
      <div className="property-group">
        <label className="property-label">Name</label>
        <input
          type="text"
          className="property-input"
          value={selectedItem.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
        />
      </div>

      <div className="property-group">
        <label className="property-label">Label</label>
        <input
          type="text"
          className="property-input"
          value={selectedItem.label || ''}
          onChange={(e) => handleInputChange('label', e.target.value)}
          placeholder="Optional label"
        />
      </div>

      <div className="property-group">
        <label className="property-label">
          Position X
          {selectedItem.isPositionLocked && <span style={{ color: '#FF5722', marginLeft: '8px' }}>🔒</span>}
          <span style={{ color: '#4CAF50', marginLeft: '8px', fontSize: '0.8rem' }}>
            📐 Grid: {selectedItem.type === 'solid_boundary' || selectedItem.type === 'dotted_boundary' ? 15 : (selectedItem.gridStep || (selectedItem.gridAligned ? 60 : 15))}px
          </span>
        </label>
        <input
          type="number"
          className="property-input"
          value={selectedItem.x}
          onChange={(e) => handleNumberChange('x', e.target.value)}
          min="0"
          step={selectedItem.type === 'solid_boundary' || selectedItem.type === 'dotted_boundary' ? 15 : (selectedItem.gridStep || (selectedItem.gridAligned ? 60 : 15))}
          disabled={selectedItem.isPositionLocked}
          style={{ 
            opacity: selectedItem.isPositionLocked ? 0.6 : 1,
            cursor: selectedItem.isPositionLocked ? 'not-allowed' : 'text'
          }}
        />
        <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '4px' }}>
          Grid position: {Math.round(selectedItem.x / (selectedItem.type === 'solid_boundary' || selectedItem.type === 'dotted_boundary' ? 15 : (selectedItem.gridStep || (selectedItem.gridAligned ? 60 : 15))))} × {selectedItem.type === 'solid_boundary' || selectedItem.type === 'dotted_boundary' ? 15 : (selectedItem.gridStep || (selectedItem.gridAligned ? 60 : 15))}px
        </div>
      </div>

      <div className="property-group">
        <label className="property-label">
          Position Y
          {selectedItem.isPositionLocked && <span style={{ color: '#FF5722', marginLeft: '8px' }}>🔒</span>}
          <span style={{ color: '#4CAF50', marginLeft: '8px', fontSize: '0.8rem' }}>
            📐 Grid: {selectedItem.type === 'solid_boundary' || selectedItem.type === 'dotted_boundary' ? 15 : (selectedItem.gridStep || (selectedItem.gridAligned ? 60 : 15))}px
          </span>
        </label>
        <input
          type="number"
          className="property-input"
          value={selectedItem.y}
          onChange={(e) => handleNumberChange('y', e.target.value)}
          min="0"
          step={selectedItem.type === 'solid_boundary' || selectedItem.type === 'dotted_boundary' ? 15 : (selectedItem.gridStep || (selectedItem.gridAligned ? 60 : 15))}
          disabled={selectedItem.isPositionLocked}
          style={{ 
            opacity: selectedItem.isPositionLocked ? 0.6 : 1,
            cursor: selectedItem.isPositionLocked ? 'not-allowed' : 'text'
          }}
        />
        <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '4px' }}>
          Grid position: {Math.round(selectedItem.y / (selectedItem.type === 'solid_boundary' || selectedItem.type === 'dotted_boundary' ? 15 : (selectedItem.gridStep || (selectedItem.gridAligned ? 60 : 15))))} × {selectedItem.type === 'solid_boundary' || selectedItem.type === 'dotted_boundary' ? 15 : (selectedItem.gridStep || (selectedItem.gridAligned ? 60 : 15))}px
        </div>
      </div>

      <div className="property-group">
        <label className="property-label">
          Width
          {selectedItem.isSizeLocked && <span style={{ color: '#3F51B5', marginLeft: '8px' }}>📐</span>}
          {selectedItem.gridStep && (
            <span style={{ color: '#4CAF50', marginLeft: '8px', fontSize: '0.8rem' }}>
              📏 Grid: {selectedItem.gridStep}px
            </span>
          )}
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="number"
            className="property-input"
            value={selectedItem.width}
            onChange={(e) => handleNumberChange('width', e.target.value)}
            min={selectedItem.minSize?.width || selectedItem.gridStep || 20}
            max={selectedItem.maxSize?.width}
            step={selectedItem.gridStep || 1}
            disabled={selectedItem.isSizeLocked}
            style={{ 
              opacity: selectedItem.isSizeLocked ? 0.6 : 1,
              cursor: selectedItem.isSizeLocked ? 'not-allowed' : 'text',
              flex: 1
            }}
          />
          {selectedItem.gridStep && !selectedItem.isSizeLocked && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <button
                type="button"
                onClick={() => handleNumberChange('width', selectedItem.width + selectedItem.gridStep)}
                style={{
                  width: '24px',
                  height: '16px',
                  border: '1px solid #ddd',
                  background: '#f8f9fa',
                  cursor: 'pointer',
                  fontSize: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title={`Increase by ${selectedItem.gridStep}px`}
              >
                +
              </button>
              <button
                type="button"
                onClick={() => handleNumberChange('width', selectedItem.width - selectedItem.gridStep)}
                style={{
                  width: '24px',
                  height: '16px',
                  border: '1px solid #ddd',
                  background: '#f8f9fa',
                  cursor: 'pointer',
                  fontSize: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title={`Decrease by ${selectedItem.gridStep}px`}
              >
                -
              </button>
            </div>
          )}
        </div>
        {selectedItem.gridStep && (
          <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '4px' }}>
            Grid blocks: {Math.round(selectedItem.width / selectedItem.gridStep)} × {selectedItem.gridStep}px
          </div>
        )}
      </div>

      <div className="property-group">
        <label className="property-label">
          Height
          {selectedItem.isSizeLocked && <span style={{ color: '#3F51B5', marginLeft: '8px' }}>📐</span>}
          {selectedItem.gridStep && (
            <span style={{ color: '#4CAF50', marginLeft: '8px', fontSize: '0.8rem' }}>
              📏 Grid: {selectedItem.gridStep}px
            </span>
          )}
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="number"
            className="property-input"
            value={selectedItem.height}
            onChange={(e) => handleNumberChange('height', e.target.value)}
            min={selectedItem.minSize?.height || selectedItem.gridStep || 20}
            max={selectedItem.maxSize?.height}
            step={selectedItem.gridStep || 1}
            disabled={selectedItem.isSizeLocked}
            style={{ 
              opacity: selectedItem.isSizeLocked ? 0.6 : 1,
              cursor: selectedItem.isSizeLocked ? 'not-allowed' : 'text',
              flex: 1
            }}
          />
          {selectedItem.gridStep && !selectedItem.isSizeLocked && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <button
                type="button"
                onClick={() => handleNumberChange('height', selectedItem.height + selectedItem.gridStep)}
                style={{
                  width: '24px',
                  height: '16px',
                  border: '1px solid #ddd',
                  background: '#f8f9fa',
                  cursor: 'pointer',
                  fontSize: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title={`Increase by ${selectedItem.gridStep}px`}
              >
                +
              </button>
              <button
                type="button"
                onClick={() => handleNumberChange('height', selectedItem.height - selectedItem.gridStep)}
                style={{
                  width: '24px',
                  height: '16px',
                  border: '1px solid #ddd',
                  background: '#f8f9fa',
                  cursor: 'pointer',
                  fontSize: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title={`Decrease by ${selectedItem.gridStep}px`}
              >
                -
              </button>
            </div>
          )}
        </div>
        {selectedItem.gridStep && (
          <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '4px' }}>
            Grid blocks: {Math.round(selectedItem.height / selectedItem.gridStep)} × {selectedItem.gridStep}px
          </div>
        )}
      </div>


      <div className="property-group" style={{ marginTop: '2rem' }}>
        <button 
          className="btn btn-danger"
          onClick={handleDelete}
          style={{ width: '100%' }}
        >
          🗑️ Delete Item
        </button>
      </div>

      {/* Stack Information */}
      {selectedItem.stack && selectedItem.stack.layers && selectedItem.stack.layers.length > 1 && (
        <div className="property-group" style={{ marginTop: '2rem' }}>
          <label className="property-label">Stack Information</label>
          <div style={{ 
            padding: '1rem', 
            background: '#e3f2fd', 
            borderRadius: '6px',
            fontSize: '0.9rem'
          }}>
            <div style={{ marginBottom: '0.5rem' }}>
              <strong>📚 Layers:</strong> {selectedItem.stack.layers.length}
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <strong>📦 Total SKUs:</strong> {selectedItem.stack.layers.reduce((total, layer) => 
                total + (layer.skus ? layer.skus.length : 0), 0
              )}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#666' }}>
              Right-click to manage stack layers and SKUs
            </div>
          </div>
        </div>
      )}

      {/* Storage Unit SKU Management */}
      {selectedItem.hasSku && selectedItem.singleSku && (
        <div className="property-group" style={{ marginTop: '2rem' }}>
          <label className="property-label">📦 Storage Unit SKU</label>
          <div style={{ 
            padding: '1rem', 
            background: selectedItem.skuId ? '#E0F7FA' : '#FFF3E0', 
            borderRadius: '6px',
            fontSize: '0.85rem',
            border: selectedItem.skuId ? '1px solid #00BCD4' : '1px solid #FF9800'
          }}>
            {selectedItem.skuId ? (
              <div>
                <div style={{ marginBottom: '0.5rem', color: '#006064' }}>
                  <strong>SKU ID:</strong> {selectedItem.skuId}
                </div>
                {selectedItem.skuData && (
                  <>
                    <div style={{ marginBottom: '0.5rem', color: '#006064' }}>
                      <strong>Status:</strong> {selectedItem.skuData.status || 'planned'}
                    </div>
                    <div style={{ marginBottom: '0.5rem', color: '#006064' }}>
                      <strong>Quantity:</strong> {selectedItem.skuData.quantity || 1}
                    </div>
                    <div style={{ marginBottom: '0.5rem', color: '#006064' }}>
                      <strong>Availability:</strong> {selectedItem.skuData.availability || 'available'}
                    </div>
                  </>
                )}
                <button
                  onClick={() => {
                    const newSkuId = prompt('Edit SKU ID:', selectedItem.skuId);
                    if (newSkuId && newSkuId.trim() && newSkuId !== selectedItem.skuId) {
                      onUpdateItem(selectedItem.id, { 
                        skuId: newSkuId.trim(),
                        skuData: {
                          ...selectedItem.skuData,
                          locationId: newSkuId.trim(),
                          uniqueId: newSkuId.trim(),
                          sku: newSkuId.trim(),
                          lastModified: new Date().toISOString()
                        }
                      });
                    }
                  }}
                  style={{
                    padding: '4px 8px',
                    backgroundColor: '#00BCD4',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    cursor: 'pointer',
                    marginRight: '8px'
                  }}
                >
                  Edit SKU ID
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Remove SKU ID from this Storage Unit?')) {
                      onUpdateItem(selectedItem.id, { skuId: null, skuData: null });
                    }
                  }}
                  style={{
                    padding: '4px 8px',
                    backgroundColor: '#f44336',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '0.75rem',
                    cursor: 'pointer'
                  }}
                >
                  Remove SKU
                </button>
              </div>
            ) : (
              <div style={{ color: '#E65100', textAlign: 'center' }}>
                <div style={{ marginBottom: '0.5rem', fontWeight: 'bold' }}>
                  No SKU assigned
                </div>
                <div style={{ fontSize: '0.8rem', marginBottom: '1rem' }}>
                  Click on the Storage Unit to assign a sequential SKU ID
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* SKU Holder Management */}
      {selectedItem.skuGrid && (() => {
        // Calculate compartments based on 60px grid system
        // Each 60x60px grid block = 1 SKU compartment
        const gridSize = 60; // Base grid size
        
        // Calculate how many grid blocks fit in current dimensions
        const cols = Math.max(1, Math.floor(selectedItem.width / gridSize));
        const rows = Math.max(1, Math.floor(selectedItem.height / gridSize));
        const totalCompartments = rows * cols;
        const occupiedCount = selectedItem.compartmentContents ? Object.keys(selectedItem.compartmentContents).length : 0;
        
        // Helper function to generate unique Location ID
        const generateUniqueLocationId = (itemName, row, col) => {
          // Extract zone/unit identifier from item name or use default
          const unitPrefix = itemName ? itemName.replace(/[^A-Z0-9]/g, '').substring(0, 3) || 'STG' : 'STG';
          const zone = String.fromCharCode(65 + (Math.floor((row + col) / 4) % 26)); // A, B, C, etc.
          const aisle = String(Math.floor((row + col) / 2) + 1).padStart(2, '0'); // 01, 02, etc.
          const position = String((row * cols + col) + 1).padStart(3, '0'); // 001, 002, etc.
          return `${unitPrefix}-${zone}${aisle}-${position}`;
        };
        
        // Helper function to update SKU metadata
        const updateSkuMetadata = (compartmentId, updates) => {
          const currentContents = selectedItem.compartmentContents || {};
          const currentSku = currentContents[compartmentId] || {};
          const updatedSku = { ...currentSku, ...updates };
          const newContents = { ...currentContents, [compartmentId]: updatedSku };
          onUpdateItem(selectedItem.id, { compartmentContents: newContents });
        };
        
        return (
          <div className="property-group" style={{ marginTop: '2rem' }}>
            <label className="property-label">📋 SKU Compartments</label>
            <div style={{ 
              padding: '1rem', 
              background: '#E0F7FA', 
              borderRadius: '6px',
              fontSize: '0.85rem',
              border: '1px solid #00BCD4'
            }}>
              <div style={{ marginBottom: '0.5rem', color: '#006064' }}>
                <strong>Layout:</strong> {rows} rows × {cols} cols (Dynamic)
              </div>
              <div style={{ marginBottom: '0.5rem', color: '#006064' }}>
                <strong>Total Compartments:</strong> {totalCompartments}
              </div>
              <div style={{ marginBottom: '0.5rem', color: '#006064' }}>
                <strong>Occupied:</strong> {occupiedCount}
              </div>
              <div style={{ marginBottom: '1rem', color: '#006064' }}>
                <strong>Available:</strong> {totalCompartments - occupiedCount}
              </div>
              
              {/* Compartment Grid Display */}
              <div style={{ marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.8rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Compartment Status:</div>
                <div style={{
                  display: 'grid',
                  gridTemplateRows: `repeat(${rows}, 1fr)`,
                  gridTemplateColumns: `repeat(${cols}, 1fr)`,
                  gap: '2px',
                  maxWidth: '120px'
                }}>
                  {Array.from({ length: totalCompartments }).map((_, index) => {
                    const row = Math.floor(index / cols);
                    const col = index % cols;
                    const compartmentId = `${row}-${col}`;
                    const hasItem = selectedItem.compartmentContents && selectedItem.compartmentContents[compartmentId];
                    
                    return (
                      <div
                        key={index}
                        style={{
                          width: '20px',
                          height: '20px',
                          border: '1px solid #00BCD4',
                          borderRadius: '2px',
                          backgroundColor: hasItem ? '#00BCD4' : 'rgba(224, 247, 250, 0.5)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.6rem',
                          color: hasItem ? 'white' : '#006064',
                          cursor: 'pointer'
                        }}
                        title={hasItem ? `Location ID: ${hasItem.locationId || hasItem.uniqueId}\nSKU: ${hasItem.sku || 'N/A'}\nStatus: ${hasItem.status || 'unknown'}` : `Empty compartment ${row + 1}-${col + 1}`}
                        onClick={() => {
                          if (hasItem) {
                            // Edit existing Location ID
                            const newLocationId = prompt('Edit Location ID:', hasItem.locationId || hasItem.uniqueId || hasItem.sku);
                            if (newLocationId && newLocationId.trim()) {
                              updateSkuMetadata(compartmentId, {
                                locationId: newLocationId.trim(),
                                uniqueId: newLocationId.trim(), // Keep for backward compatibility
                                sku: hasItem.sku, // Keep original SKU for reference
                                lastModified: new Date().toISOString()
                              });
                            }
                          } else {
                            // Show SKU ID selector for new item
                            setPendingCompartmentId(compartmentId);
                            setSkuIdSelectorVisible(true);
                          }
                        }}
                      >
                        {hasItem ? '✓' : '○'}
                      </div>
                    );
                  })}
                </div>
              </div>
              
              {/* Location Details with Detailed Management */}
              {selectedItem.compartmentContents && Object.keys(selectedItem.compartmentContents).length > 0 && (
                <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.8rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Location Details:</div>
                  <div style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #00BCD4', borderRadius: '4px' }}>
                    {Object.entries(selectedItem.compartmentContents).map(([compartmentId, itemData]) => {
                      const [row, col] = compartmentId.split('-').map(Number);
                      return (
                        <div key={compartmentId} style={{
                          padding: '0.5rem',
                          borderBottom: '1px solid #E0F7FA',
                          fontSize: '0.75rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <div>
                            <div style={{ fontWeight: 'bold', color: '#006064' }}>
                              Location: {itemData.locationId || itemData.uniqueId || itemData.sku}
                            </div>
                            <div style={{ color: '#666' }}>
                              Position: {row + 1}-{col + 1} | Status: {itemData.status || 'planned'}
                            </div>
                            {itemData.sku && (
                              <div style={{ color: '#666', fontSize: '0.7rem' }}>
                                SKU: {itemData.sku}
                              </div>
                            )}
                            {itemData.category && (
                              <div style={{ color: '#666', fontSize: '0.7rem' }}>
                                Category: {itemData.category}
                              </div>
                            )}
                          </div>
                          <div style={{ display: 'flex', gap: '0.25rem' }}>
                            <button
                              onClick={() => {
                                const newLocationId = prompt('Edit Location ID:', itemData.locationId || itemData.uniqueId || itemData.sku);
                                if (newLocationId && newLocationId.trim()) {
                                  updateSkuMetadata(compartmentId, {
                                    locationId: newLocationId.trim(),
                                    uniqueId: newLocationId.trim(), // Keep for backward compatibility
                                    lastModified: new Date().toISOString()
                                  });
                                }
                              }}
                              style={{
                                padding: '0.2rem 0.4rem',
                                fontSize: '0.6rem',
                                backgroundColor: '#4CAF50',
                                color: 'white',
                                border: 'none',
                                borderRadius: '2px',
                                cursor: 'pointer'
                              }}
                              title="Edit Location ID"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Delete item at location "${itemData.locationId || itemData.uniqueId || itemData.sku}"?`)) {
                                  const newContents = { ...selectedItem.compartmentContents };
                                  delete newContents[compartmentId];
                                  onUpdateItem(selectedItem.id, { compartmentContents: newContents });
                                }
                              }}
                              style={{
                                padding: '0.2rem 0.4rem',
                                fontSize: '0.6rem',
                                backgroundColor: '#F44336',
                                color: 'white',
                                border: 'none',
                                borderRadius: '2px',
                                cursor: 'pointer'
                              }}
                              title="Delete Location"
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* SKU Management Actions */}
              <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.8rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>Quick Actions:</div>
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => {
                      const customId = prompt('Enter custom SKU ID:');
                      if (customId && customId.trim()) {
                        // Find first empty compartment
                        let emptyCompartment = null;
                        for (let r = 0; r < rows && !emptyCompartment; r++) {
                          for (let c = 0; c < cols && !emptyCompartment; c++) {
                            const compartmentId = `${r}-${c}`;
                            if (!selectedItem.compartmentContents || !selectedItem.compartmentContents[compartmentId]) {
                              emptyCompartment = compartmentId;
                            }
                          }
                        }
                        if (emptyCompartment) {
                          const newContents = { 
                            ...selectedItem.compartmentContents, 
                            [emptyCompartment]: {
                              uniqueId: customId.trim(),
                              sku: `SKU-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
                              quantity: 1,
                              status: 'planned',
                              category: '',
                              storageSpace: `${Math.floor(selectedItem.width / gridSize)}x${Math.floor(selectedItem.height / gridSize)}`,
                              availability: 'available',
                              createdAt: new Date().toISOString(),
                              lastModified: new Date().toISOString(),
                              metadata: {
                                weight: null,
                                dimensions: null,
                                temperature: null,
                                hazardous: false,
                                priority: 'normal'
                              }
                            }
                          };
                          onUpdateItem(selectedItem.id, { compartmentContents: newContents });
                        } else {
                          alert('No empty compartments available. Resize the SKU Holder to add more space.');
                        }
                      }
                    }}
                    style={{
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.7rem',
                      backgroundColor: '#00BCD4',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer'
                    }}
                  >
                    + Add SKU
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm('Clear all SKUs from this holder?')) {
                        onUpdateItem(selectedItem.id, { compartmentContents: {} });
                      }
                    }}
                    style={{
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.7rem',
                      backgroundColor: '#F44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer'
                    }}
                  >
                    Clear All
                  </button>
                  <button
                    onClick={() => {
                      // Auto-fill with sample SKUs with unique IDs
                      const newContents = {};
                      let skuCounter = 1;
                      const timestamp = Date.now();
                      for (let r = 0; r < rows; r++) {
                        for (let c = 0; c < cols; c++) {
                          const compartmentId = `${r}-${c}`;
                          const uniqueId = `${selectedItem.name || 'HOLDER'}-${String(skuCounter).padStart(3, '0')}`;
                          newContents[compartmentId] = { 
                            uniqueId: uniqueId,
                            sku: `SKU-${String(skuCounter).padStart(3, '0')}`, 
                            quantity: 1,
                            status: 'planned',
                            category: 'general',
                            storageSpace: `${Math.floor(selectedItem.width / gridSize)}x${Math.floor(selectedItem.height / gridSize)}`,
                            availability: 'available',
                            createdAt: new Date(timestamp + skuCounter * 1000).toISOString(),
                            lastModified: new Date(timestamp + skuCounter * 1000).toISOString(),
                            metadata: {
                              weight: null,
                              dimensions: null,
                              temperature: null,
                              hazardous: false,
                              priority: 'normal'
                            }
                          };
                          skuCounter++;
                        }
                      }
                      onUpdateItem(selectedItem.id, { compartmentContents: newContents });
                    }}
                    style={{
                      padding: '0.25rem 0.5rem',
                      fontSize: '0.7rem',
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '3px',
                      cursor: 'pointer'
                    }}
                  >
                    Fill All
                  </button>
                </div>
              </div>
              
              <div style={{ fontSize: '0.75rem', color: '#666', fontStyle: 'italic' }}>
                <strong>Usage:</strong> Click compartments to add/edit SKU IDs. Each 60×60px grid block = 1 SKU compartment.<br/>
                <strong>Future Ready:</strong> SKUs include metadata fields for category, storage space, availability, and operational data.
              </div>
            </div>
          </div>
        );
      })()}

      {/* Grid Information Panel */}
      {selectedItem.gridStep && (
        <div className="property-group" style={{ marginTop: '2rem' }}>
          <label className="property-label">📏 Grid Information</label>
          <div style={{ 
            padding: '1rem', 
            background: '#e8f5e8', 
            borderRadius: '6px',
            fontSize: '0.85rem',
            border: '1px solid #4CAF50'
          }}>
            <div style={{ marginBottom: '0.5rem', color: '#2E7D32' }}>
              <strong>Grid Size:</strong> {selectedItem.gridStep}px × {selectedItem.gridStep}px
            </div>
            <div style={{ marginBottom: '0.5rem', color: '#2E7D32' }}>
              <strong>Current Size:</strong> {Math.round(selectedItem.width / selectedItem.gridStep)} × {Math.round(selectedItem.height / selectedItem.gridStep)} blocks
            </div>
            <div style={{ marginBottom: '0.5rem', color: '#2E7D32' }}>
              <strong>Dimensions:</strong> {selectedItem.width}px × {selectedItem.height}px
            </div>
            {selectedItem.minSize && (
              <div style={{ marginBottom: '0.5rem', color: '#666', fontSize: '0.8rem' }}>
                <strong>Min Size:</strong> {selectedItem.minSize.width}px × {selectedItem.minSize.height}px
              </div>
            )}
            {selectedItem.maxSize && (
              <div style={{ marginBottom: '0.5rem', color: '#666', fontSize: '0.8rem' }}>
                <strong>Max Size:</strong> {selectedItem.maxSize.width}px × {selectedItem.maxSize.height}px
              </div>
            )}
            <div style={{ fontSize: '0.75rem', color: '#666', fontStyle: 'italic' }}>
              Resizing is constrained to {selectedItem.gridStep}px increments
            </div>
          </div>
        </div>
      )}

      <div style={{ 
        marginTop: '2rem', 
        padding: '1rem', 
        background: '#f8f9fa', 
        borderRadius: '6px',
        fontSize: '0.8rem',
        color: '#666'
      }}>
        <strong>Type:</strong> {selectedItem.type}<br/>
        <strong>ID:</strong> {selectedItem.id.substring(0, 8)}...<br/>
        {selectedItem.stack && selectedItem.stack.layers && selectedItem.stack.layers.length > 1 && (
          <><strong>Stacked:</strong> Yes ({selectedItem.stack.layers.length} layers)<br/></>
        )}
        {selectedItem.gridStep && (
          <><strong>Grid-Aligned:</strong> Yes ({selectedItem.gridStep}px grid)<br/></>
        )}
      </div>

      {/* SKU ID Selector Modal */}
      <SkuIdSelector
        isVisible={skuIdSelectorVisible}
        onClose={handleSkuIdSelectorClose}
        onSave={handleSkuIdSelect}
        existingSkuIds={getExistingSkuIds()}
      />
    </div>
  );
};

export default PropertiesPanel;
