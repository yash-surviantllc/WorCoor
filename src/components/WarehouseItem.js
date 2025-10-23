import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useDrag } from 'react-dnd';
import { DRAG_TYPES, STACKABLE_COMPONENTS, STATUS_COLORS, OCCUPANCY_STATUS, ORIENTATION_COLORS } from '../constants/warehouseComponents';
import { getComponentColor } from '../utils/componentColors';
import { renderShapeComponent } from '../utils/shapeRenderer';
import { getContextualLabel, generateStorageUnitLabelInfo } from '../utils/componentLabeling';

const WarehouseItem = ({ 
  item, 
  isSelected, 
  onSelect, 
  onUpdate, 
  onDelete, 
  zoomLevel, 
  snapToGrid, 
  gridSize, 
  onRequestSkuId, 
  onRightClick, 
  onInfoClick, 
  stackMode 
}) => {
  const [{ isDragging }, drag] = useDrag({
    type: DRAG_TYPES.WAREHOUSE_ITEM,
    item: { 
      id: item.id,
      type: item.type,
      x: item.x,
      y: item.y,
      isPositionLocked: item.isPositionLocked,
      isSizeLocked: item.isSizeLocked
    },
    canDrag: () => !item.isPositionLocked, // Prevent dragging when position is locked
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const handleClick = (e) => {
    e.stopPropagation();
    
    // Handle Storage Unit Location assignment
    if (item.type === 'storage_unit' && item.hasSku && item.singleSku) {
      if (!item.locationId && onRequestSkuId) {
        // Request Location ID for empty Storage Unit
        onRequestSkuId(item.id, 'single-sku', 0, 0);
        return;
      }
    }
    
    onSelect(item.id);
  };

  const handleDoubleClick = (e) => {
    e.stopPropagation();
    const newName = prompt('Enter new name:', item.name);
    if (newName && newName !== item.name) {
      onUpdate(item.id, { name: newName });
    }
  };

  const handleRightClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onRightClick) {
      onRightClick(e, item);
    }
  };

  const handleInfoClick = (e) => {
    e.stopPropagation();
    if (onInfoClick) {
      onInfoClick(e, item);
    }
  };

  const isStackable = STACKABLE_COMPONENTS.includes(item.type);
  const hasStack = item.stack && item.stack.layers && item.stack.layers.length > 1;
  const isContainer = item.isContainer;

  // Resize handling functions
  const handleResizeStart = (e, direction) => {
    e.stopPropagation();
    e.preventDefault();
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = item.width;
    const startHeight = item.height;
    // Use major grid (60px) for square boundary, sub-grid (15px) for others
    const gridSize = (item.type === 'square_boundary' || item.gridAligned) ? 60 : 15;
    
    const handleMouseMove = (moveEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaY = moveEvent.clientY - startY;
      
      let newWidth = startWidth;
      let newHeight = startHeight;
      
      if (direction === 'corner' || direction === 'right') {
        newWidth = Math.max(gridSize, Math.round((startWidth + deltaX) / gridSize) * gridSize);
      }
      
      if (direction === 'corner' || direction === 'bottom') {
        newHeight = Math.max(gridSize, Math.round((startHeight + deltaY) / gridSize) * gridSize);
      }
      
      // Apply min/max constraints if specified
      if (item.minSize) {
        newWidth = Math.max(item.minSize.width || gridSize, newWidth);
        newHeight = Math.max(item.minSize.height || gridSize, newHeight);
      }
      
      if (item.maxSize) {
        newWidth = Math.min(item.maxSize.width || 1200, newWidth);
        newHeight = Math.min(item.maxSize.height || 1200, newHeight);
      }
      
      // Update the item dimensions
      if (onUpdate && (newWidth !== item.width || newHeight !== item.height)) {
        onUpdate(item.id, { width: newWidth, height: newHeight });
      }
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  const isContained = item.containerId;
  const containerLevel = item.containerLevel || 0;
  const isMainBoundary = containerLevel === 1;
  const isZone = containerLevel === 2;
  const isUnit = containerLevel === 3;
  
  // Get status-based styling
  const occupancyStatus = item.occupancyStatus || OCCUPANCY_STATUS.EMPTY;
  const statusColor = STATUS_COLORS[occupancyStatus] || '#ddd';
  // Remove orientation color override to maintain fixed component colors
  // const orientationColor = item.storageOrientation ? ORIENTATION_COLORS[item.storageOrientation] : null;

  return (
    <div
      ref={drag}
      className={`warehouse-item ${isSelected ? 'selected' : ''} ${isDragging ? 'dragging' : ''} ${isContainer ? 'container' : ''} ${isContained ? 'contained' : ''} ${isMainBoundary ? 'main-boundary' : ''} ${isZone ? 'zone' : ''} ${isUnit ? 'unit' : ''}`}
      data-type={item.type}
      data-occupancy={item.occupancyStatus || OCCUPANCY_STATUS.EMPTY}
      data-container={isContainer}
      data-contained={isContained}
      data-container-level={containerLevel}
      data-position-locked={item.isPositionLocked || false}
      data-size-locked={item.isSizeLocked || false}
      style={{
        left: item.x,
        top: item.y,
        width: item.width,
        height: item.height,
        backgroundColor: item.isHollow ? 'transparent' : 
          (item.type === 'storage_unit' ? getComponentColor(item.type, item.category) : 
           item.type === 'sku_holder' ? 'rgba(33, 150, 243, 0.15)' :
           item.type === 'vertical_sku_holder' ? 'rgba(255, 87, 34, 0.15)' :
           isContainer ? 'transparent' : 
           getComponentColor(item.type, item.category)),
        border: item.type === 'storage_unit' ? `2px solid ${getComponentColor(item.type, item.category) === '#4CAF50' ? '#388E3C' : getComponentColor(item.type, item.category)}` :
               item.type === 'sku_holder' || item.type === 'vertical_sku_holder' ? '2px solid #000000' : 
               (item.type === 'square_boundary' ? '4px solid #000000' : 
               (isMainBoundary ? '4px solid #263238' : 
               (isZone ? `3px solid ${getComponentColor(item.type)}` : 
               (isContainer ? `3px solid ${getComponentColor(item.type)}` : 
               (isContained ? `2px dashed ${getComponentColor(item.type) || statusColor}` : `3px solid ${getComponentColor(item.type) || statusColor}`))))),
        borderRadius: item.type === 'storage_unit' ? '4px' : '0px',
        boxShadow: item.type === 'storage_unit' ? `0 1px 3px ${getComponentColor(item.type, item.category)}33` : 'none',
        opacity: isDragging ? 0.7 : 1,
        position: 'absolute',
        zIndex: isMainBoundary ? 0 : (isZone ? 1 : (isContainer ? 1 : (isContained ? 10 : 5)))
      }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onContextMenu={handleRightClick}
    >
      {/* Shape rendering for shape components */}
      {item.isShape && renderShapeComponent(item)}
      
      {/* Storage Racks - Show only Location ID in black text */}
      {(item.type === 'sku_holder' || item.type === 'vertical_sku_holder') && !item.showCompartments && (() => {
        // Only show location ID if user has actually selected one from dropdown
        const locationInfo = item.locationId || null;
        
        return locationInfo ? (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none',
            userSelect: 'none',
            fontFamily: 'Arial, sans-serif',
            maxWidth: '95%'
          }}>
            {/* Location ID - Only show when user selects from dropdown - Black text */}
            <div style={{
              color: '#000000',
              fontSize: '11px',
              fontWeight: 'bold'
            }}>
              {locationInfo}
            </div>
          </div>
        ) : null;
      })()}

      {/* SKU compartment grid rendering for SKU Holder components */}
      {item.skuGrid && item.showCompartments && (() => {
        // Calculate compartments based on 60px grid system
        // Each 60x60px grid block = 1 SKU compartment
        const gridSize = 60; // Base grid size
        
        // Calculate how many grid blocks fit in current dimensions
        const cols = Math.max(1, Math.floor(item.width / gridSize));
        const rows = Math.max(1, Math.floor(item.height / gridSize));
        
        const totalCompartments = rows * cols;
        
        // Determine colors based on rack type
        const isVertical = item.type === 'vertical_sku_holder';
        const borderColor = '#000000'; // Black borders for all racks
        const bgColorFilled = isVertical ? '#FFE0D6' : '#E0F7FA'; // Light orange for vertical, light cyan for horizontal
        const bgColorEmpty = isVertical ? '#FFF3E0' : '#E3F2FD'; // Light orange for vertical, light blue for horizontal
        const textColor = isVertical ? '#BF360C' : '#006064'; // Dark orange for vertical, dark cyan for horizontal
        
        return (
          <div style={{
            position: 'absolute',
            top: '6px',
            left: '6px',
            right: '6px',
            bottom: '6px',
            display: 'grid',
            gridTemplateRows: `repeat(${rows}, 1fr)`,
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: '3px',
            zIndex: 2,
            padding: '2px',
            borderRadius: '0px',
            backgroundColor: isVertical ? 'rgba(255, 87, 34, 0.15)' : 'rgba(33, 150, 243, 0.15)'
          }}>
            {Array.from({ length: totalCompartments }).map((_, index) => {
              const row = Math.floor(index / cols);
              const col = index % cols;
              const compartmentId = `${row}-${col}`;
              const hasItem = item.compartmentContents && item.compartmentContents[compartmentId];
              
              return (
                <div
                  key={index}
                  style={{
                    border: hasItem ? `2px solid #000000` : `1px solid #000000`,
                    borderRadius: '0px',
                    backgroundColor: hasItem ? bgColorFilled : bgColorEmpty,
                    boxShadow: hasItem ? `0 2px 4px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.5)` : `inset 0 1px 2px rgba(0,0,0,0.1)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.6rem',
                    color: textColor,
                    fontWeight: 'bold',
                    position: 'relative',
                    minHeight: '16px',
                    cursor: 'pointer',
                    transition: isVertical ? 'none' : 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    // Apply hover effects for both horizontal and vertical racks
                    if (isVertical) {
                      // Vertical rack hover: only background color change, no glow/shadow
                      const hoverBgFilled = '#FFD4C4'; // Slightly darker orange for filled
                      const hoverBgEmpty = '#FFE8DC'; // Slightly darker orange for empty
                      e.target.style.backgroundColor = hasItem ? hoverBgFilled : hoverBgEmpty;
                      // Keep original border and shadow - no glow effect
                      e.target.style.borderColor = '#000000';
                      e.target.style.boxShadow = hasItem ? `0 2px 4px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.5)` : `inset 0 1px 2px rgba(0,0,0,0.1)`;
                    } else {
                      // Horizontal rack hover: blue effect with glow
                      const hoverBgFilled = '#B2EBF2';
                      const hoverBgEmpty = '#BBDEFB';
                      const hoverBorder = '#333333';
                      e.target.style.backgroundColor = hasItem ? hoverBgFilled : hoverBgEmpty;
                      e.target.style.borderColor = hoverBorder;
                      e.target.style.transform = 'scale(1.05)';
                      e.target.style.boxShadow = hasItem ? `0 4px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.7)` : `0 2px 6px rgba(0,0,0,0.2)`;
                    }
                  }}
                  onMouseLeave={(e) => {
                    // Reset hover effects for both rack types
                    e.target.style.backgroundColor = hasItem ? bgColorFilled : bgColorEmpty;
                    e.target.style.borderColor = '#000000';
                    if (!isVertical) {
                      e.target.style.transform = 'scale(1)';
                    }
                    e.target.style.boxShadow = hasItem ? `0 2px 4px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.5)` : `inset 0 1px 2px rgba(0,0,0,0.1)`;
                  }}
                  title={hasItem ? (() => {
                    if (hasItem.isMultiLocation && hasItem.locationIds && hasItem.tags) {
                      const locationInfo = hasItem.locationIds.map((id, idx) => `${id}${hasItem.tags[idx] ? ` (${hasItem.tags[idx]})` : ''}`).join(', ');
                      return `Multiple Locations: ${locationInfo}\nSKU: ${hasItem.sku || 'N/A'}\nStatus: ${hasItem.status || 'planned'}\nCategory: ${hasItem.category || 'none'}\n(Right-click to delete)`;
                    }
                    return `Location ID: ${hasItem.locationId || hasItem.uniqueId}\nSKU: ${hasItem.sku || 'N/A'}\nStatus: ${hasItem.status || 'planned'}\nCategory: ${hasItem.category || 'none'}\n(Right-click to delete)`;
                  })() : `Empty compartment ${row + 1}-${col + 1} (Click to add item)`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onUpdate) {
                      if (!hasItem) {
                        // Only allow adding new items, not editing existing ones
                        if (onRequestSkuId) {
                          onRequestSkuId(item.id, compartmentId, row, col);
                        }
                      }
                      // Clicking on existing items does nothing (no edit functionality)
                    }
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (hasItem && onUpdate) {
                      // Delete item from location
                      if (window.confirm(`Delete item at location "${hasItem.locationId || hasItem.uniqueId}" from compartment ${row + 1}-${col + 1}?`)) {
                        const newContents = { ...item.compartmentContents };
                        delete newContents[compartmentId];
                        onUpdate(item.id, { compartmentContents: newContents });
                      }
                    }
                  }}
                >
                  {hasItem ? (
                    // Show Location ID if compartment is large enough, otherwise show dot
                    (item.width - 8) / cols > 40 && (item.height - 8) / rows > 40 ? (
                      <div style={{
                        fontSize: '0.5rem',
                        fontWeight: 'bold',
                        color: '#006064',
                        textAlign: 'center',
                        lineHeight: '1',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '90%'
                      }}>
                        {(() => {
                          // Handle multiple location IDs for vertical storage racks
                          if (hasItem.isMultiLocation && hasItem.locationIds && hasItem.locationIds.length > 0) {
                            const primaryId = hasItem.locationIds[0];
                            const count = hasItem.locationIds.length;
                            return count > 1 ? `${primaryId}+${count-1}` : primaryId;
                          }
                          
                          const displayId = hasItem.locationId || hasItem.uniqueId || hasItem.sku;
                          return displayId.length > 8 ? displayId.substring(0, 8) + '...' : displayId;
                        })()}
                      </div>
                    ) : (
                      <div style={{
                        width: '10px',
                        height: '10px',
                        backgroundColor: textColor,
                        borderRadius: '3px',
                        border: `1px solid #000000`,
                        boxShadow: `0 1px 2px rgba(0,0,0,0.3)`
                      }} />
                    )
                  ) : (
                    <div style={{
                      fontSize: '0.8rem',
                      color: textColor,
                      opacity: 0.6,
                      fontWeight: 'bold'
                    }}>
                      +
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })()}
      
      {/* Storage Units - Enhanced labeling with category and location ID */}
      {item.type === 'storage_unit' && (() => {
        const labelInfo = generateStorageUnitLabelInfo(item, 1);
        const isFragile = item.category === 'fragile';
        const textColor = isFragile ? '#000' : '#fff';
        const shadowColor = isFragile ? 
          '2px 2px 4px rgba(255,255,255,0.9), -1px -1px 2px rgba(0,0,0,0.3)' : 
          '2px 2px 4px rgba(0,0,0,0.9), -1px -1px 2px rgba(255,255,255,0.3)';
        
        // Only show location ID if user has actually selected one from dropdown
        const locationId = item.locationId || null;
        
        return (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            pointerEvents: 'none',
            userSelect: 'none',
            fontFamily: 'Arial, sans-serif',
            maxWidth: '95%'
          }}>
            {/* Storage Category Name - Simple Plain Text */}
            <div style={{
              color: textColor,
              fontSize: '12px',
              fontWeight: 'bold'
            }}>
              {labelInfo ? labelInfo.categoryText : 'Storage'}
            </div>
            
            {/* Location ID - Only show when user selects from dropdown */}
            {locationId && (
              <div style={{
                color: textColor,
                fontSize: '10px',
                marginTop: '2px'
              }}>
                {locationId}
              </div>
            )}
          </div>
        );
      })()}
      
      {/* Stack visual indicator */}
      {hasStack && (
        <>
          <div style={{
            position: 'absolute',
            top: '-3px',
            left: '3px',
            width: '100%',
            height: '100%',
            backgroundColor: item.color || '#ffffff',
            border: '2px solid #ddd',
            borderRadius: '8px',
            zIndex: -1,
            opacity: 0.7
          }} />
          <div style={{
            position: 'absolute',
            top: '-6px',
            left: '6px',
            width: '100%',
            height: '100%',
            backgroundColor: item.color || '#ffffff',
            border: '2px solid #ddd',
            borderRadius: '8px',
            zIndex: -2,
            opacity: 0.4
          }} />
        </>
      )}

      {/* Professional zone labels */}
      {isZone && item.label && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'transparent',
          color: '#333',
          fontSize: '2rem',
          fontWeight: 'bold',
          fontFamily: 'Arial, sans-serif',
          textAlign: 'center',
          zIndex: 5,
          pointerEvents: 'none',
          textShadow: '1px 1px 2px rgba(255,255,255,0.8)'
        }}>
          {item.label}
        </div>
      )}

      {/* Zone type labels for special areas */}
      {isZone && (item.zoneType === 'receiving' || item.zoneType === 'dispatch' || item.zoneType === 'office' || item.zoneType === 'transit') && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'transparent',
          color: '#333',
          fontSize: '0.8rem',
          fontWeight: 'bold',
          fontFamily: 'Arial, sans-serif',
          textAlign: 'center',
          zIndex: 5,
          pointerEvents: 'none',
          textShadow: '1px 1px 2px rgba(255,255,255,0.8)',
          lineHeight: '1.2'
        }}>
          {item.name.replace(' Area', '').replace(' Zone', '')}
          {item.label && <div style={{ fontSize: '1.2rem', marginTop: '2px' }}>{item.label}</div>}
        </div>
      )}

      {/* Contained item indicator */}
      {isContained && (
        <div style={{
          position: 'absolute',
          top: '-6px',
          right: '-6px',
          backgroundColor: '#4CAF50',
          color: 'white',
          borderRadius: '50%',
          width: '16px',
          height: '16px',
          fontSize: '0.6rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid white',
          zIndex: 15
        }}>
          ✓
        </div>
      )}

      {/* Location Code Badge - only for non-structural elements */}
      {item.locationCode && !isContainer && (
        <div style={{
          position: 'absolute',
          top: isContained ? '8px' : '-8px',
          left: '-8px',
          backgroundColor: '#2196F3',
          color: 'white',
          borderRadius: '4px',
          padding: '2px 6px',
          fontSize: '0.7rem',
          fontWeight: 'bold',
          border: '2px solid white',
          zIndex: 10
        }}>
          {item.locationCode}
        </div>
      )}

      {/* Info Button - Hidden for square boundary, SKU holder, vertical SKU holder, and storage unit to keep them clean */}
      {item.type !== 'square_boundary' && item.type !== 'sku_holder' && item.type !== 'vertical_sku_holder' && item.type !== 'storage_unit' && (
        <button
          onClick={handleInfoClick}
          style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            border: 'none',
            backgroundColor: 'rgba(33, 150, 243, 0.8)',
            color: 'white',
            fontSize: '10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            opacity: isSelected ? 1 : 0.7
          }}
          title="View details"
        >
          ℹ️
        </button>
      )}

      {/* Hide text content for square boundary, SKU holder, vertical SKU holder, and storage unit - keep them clean */}
      {item.type !== 'square_boundary' && item.type !== 'sku_holder' && item.type !== 'vertical_sku_holder' && item.type !== 'storage_unit' && (
        <div style={{ 
          textAlign: 'center', 
          fontSize: '0.8rem',
          fontWeight: '600',
          color: '#333',
          padding: '4px',
          position: 'relative',
          zIndex: 1,
          marginTop: item.locationCode ? '12px' : '4px'
        }}>
          {item.name}
        {hasStack && (
          <div style={{
            position: 'absolute',
            top: '-16px',
            right: '-8px',
            backgroundColor: '#FF5722',
            color: 'white',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.7rem',
            fontWeight: 'bold',
            border: '2px solid white'
          }}>
            {item.stack.layers.length}
          </div>
        )}
        </div>
      )}
      
      {item.type !== 'square_boundary' && item.type !== 'sku_holder' && item.type !== 'vertical_sku_holder' && item.label && (
        <div style={{ 
          fontSize: '0.7rem', 
          color: '#666',
          textAlign: 'center',
          position: 'relative',
          zIndex: 1
        }}>
          {item.label}
        </div>
      )}

      {/* Stack mode indicator - Hidden for square boundary, SKU holder, and vertical SKU holder */}
      {item.type !== 'square_boundary' && item.type !== 'sku_holder' && item.type !== 'vertical_sku_holder' && stackMode === 'enabled' && isStackable && (
        <div style={{
          position: 'absolute',
          bottom: '2px',
          right: '2px',
          backgroundColor: '#4CAF50',
          color: 'white',
          borderRadius: '4px',
          padding: '2px 4px',
          fontSize: '0.6rem',
          fontWeight: 'bold'
        }}>
          STACK
        </div>
      )}

      {/* Status and Utilization Indicators - Hidden for square boundary, SKU holder, and vertical SKU holder */}
      {item.type !== 'square_boundary' && item.type !== 'sku_holder' && item.type !== 'vertical_sku_holder' && (
      <div style={{
        position: 'absolute',
        bottom: '2px',
        left: '2px',
        right: '2px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 5
      }}>
        {/* SKU/Inventory indicator */}
        {(hasStack || (item.inventoryData && item.inventoryData.inventory && item.inventoryData.inventory.length > 0)) && (
          <div style={{
            backgroundColor: '#2196F3',
            color: 'white',
            borderRadius: '4px',
            padding: '2px 4px',
            fontSize: '0.6rem',
            fontWeight: 'bold'
          }}>
            {hasStack 
              ? `${item.stack.layers.reduce((total, layer) => total + (layer.skus ? layer.skus.length : 0), 0)} SKUs`
              : `${item.inventoryData.inventory.length} SKUs`
            }
          </div>
        )}

        {/* Utilization indicator */}
        {item.inventoryData && item.inventoryData.utilization !== undefined && (
          <div style={{
            backgroundColor: item.inventoryData.utilization > 0.8 ? '#F44336' : 
                           item.inventoryData.utilization > 0.5 ? '#FF9800' : '#4CAF50',
            color: 'white',
            borderRadius: '4px',
            padding: '2px 4px',
            fontSize: '0.6rem',
            fontWeight: 'bold'
          }}>
            {Math.round(item.inventoryData.utilization * 100)}%
          </div>
        )}
      </div>
      )}

      {/* Real-time status pulse for active locations - Hidden for square boundary, SKU holder, and vertical SKU holder */}
      {item.type !== 'square_boundary' && item.type !== 'sku_holder' && item.type !== 'vertical_sku_holder' && item.inventoryData && item.inventoryData.lastActivity && 
       new Date() - new Date(item.inventoryData.lastActivity) < 3600000 && ( // Within last hour
        <div style={{
          position: 'absolute',
          top: '-4px',
          right: '-4px',
          width: '12px',
          height: '12px',
          backgroundColor: '#4CAF50',
          borderRadius: '50%',
          border: '2px solid white',
          animation: 'pulse 2s infinite',
          zIndex: 15
        }} />
      )}

      {/* Position lock indicator */}
      {item.isPositionLocked && (
        <div
          className="position-lock-indicator"
          style={{
            position: 'absolute',
            top: '4px',
            left: '4px',
            width: '20px',
            height: '20px',
            backgroundColor: 'rgba(255, 87, 34, 0.9)',
            color: 'white',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            zIndex: 25,
            border: '1px solid white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
          title="Position is locked - Right-click to unlock"
        >
          🔒
        </div>
      )}

      {/* Size lock indicator */}
      {item.isSizeLocked && (
        <div
          className="size-lock-indicator"
          style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            width: '20px',
            height: '20px',
            backgroundColor: 'rgba(63, 81, 181, 0.9)',
            color: 'white',
            borderRadius: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            zIndex: 25,
            border: '1px solid white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}
          title="Size is locked - Right-click to unlock"
        >
          📐
        </div>
      )}

      {/* Resize handles for resizable components - hidden when size is locked */}
      {item.resizable && isSelected && !item.isSizeLocked && (
        <>
          {/* Corner resize handle (bottom-right) */}
          <div
            className="resize-handle corner"
            style={{
              position: 'absolute',
              bottom: '-4px',
              right: '-4px',
              width: '12px',
              height: '12px',
              backgroundColor: '#2196F3',
              border: '2px solid white',
              borderRadius: '2px',
              cursor: 'nw-resize',
              zIndex: 20
            }}
            onMouseDown={(e) => handleResizeStart(e, 'corner')}
          />
          
          {/* Right edge resize handle */}
          <div
            className="resize-handle right"
            style={{
              position: 'absolute',
              top: '50%',
              right: '-4px',
              width: '8px',
              height: '20px',
              backgroundColor: '#2196F3',
              border: '1px solid white',
              borderRadius: '2px',
              cursor: 'ew-resize',
              transform: 'translateY(-50%)',
              zIndex: 20
            }}
            onMouseDown={(e) => handleResizeStart(e, 'right')}
          />
          
          {/* Bottom edge resize handle */}
          <div
            className="resize-handle bottom"
            style={{
              position: 'absolute',
              bottom: '-4px',
              left: '50%',
              width: '20px',
              height: '8px',
              backgroundColor: '#2196F3',
              border: '1px solid white',
              borderRadius: '2px',
              cursor: 'ns-resize',
              transform: 'translateX(-50%)',
              zIndex: 20
            }}
            onMouseDown={(e) => handleResizeStart(e, 'bottom')}
          />
        </>
      )}
    </div>
  );
};

// PropTypes definition
WarehouseItem.propTypes = {
  item: PropTypes.object.isRequired,
  isSelected: PropTypes.bool,
  onSelect: PropTypes.func.isRequired,
  onUpdate: PropTypes.func,
  onDelete: PropTypes.func,
  zoomLevel: PropTypes.number,
  snapToGrid: PropTypes.bool,
  gridSize: PropTypes.number,
  onRequestSkuId: PropTypes.func,
  onRightClick: PropTypes.func,
  onInfoClick: PropTypes.func,
  stackMode: PropTypes.bool
};

// Default props
WarehouseItem.defaultProps = {
  isSelected: false,
  zoomLevel: 1,
  snapToGrid: true,
  gridSize: 60,
  onRequestSkuId: null,
  onRightClick: null,
  onInfoClick: null,
  stackMode: false
};

export default WarehouseItem;
