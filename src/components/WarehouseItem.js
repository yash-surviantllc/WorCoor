import React from 'react';
import { useDrag } from 'react-dnd';
import { DRAG_TYPES, STACKABLE_COMPONENTS, STATUS_COLORS, OCCUPANCY_STATUS, ORIENTATION_COLORS } from '../constants/warehouseComponents';
import { renderShapeComponent } from '../utils/shapeRenderer';

const WarehouseItem = ({ item, isSelected, onSelect, onUpdate, onDelete, zoomLevel, snapToGrid, gridSize, onRequestSkuId, onRightClick, onInfoClick, stackMode }) => {
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
  const orientationColor = item.storageOrientation ? ORIENTATION_COLORS[item.storageOrientation] : null;

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
        backgroundColor: item.isHollow ? 'transparent' : (isContainer ? 'transparent' : (orientationColor || item.color || '#ffffff')),
        borderColor: item.type === 'square_boundary' ? '#000000' : (isMainBoundary ? '#263238' : (isZone ? (item.color || '#607D8B') : (isContainer ? (item.color || '#607D8B') : statusColor))),
        borderWidth: item.borderWidth || (isMainBoundary ? '4px' : (isZone ? '3px' : (isContainer ? '3px' : (isContained ? '2px' : '3px')))),
        borderStyle: isContainer ? 'solid' : (isContained ? 'dashed' : 'solid'),
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
      
      {/* SKU compartment grid rendering for SKU Holder components */}
      {item.skuGrid && item.showCompartments && (() => {
        // Calculate compartments based on 60px grid system
        // Each 60x60px grid block = 1 SKU compartment
        const gridSize = 60; // Base grid size
        
        // Calculate how many grid blocks fit in current dimensions
        const cols = Math.max(1, Math.floor(item.width / gridSize));
        const rows = Math.max(1, Math.floor(item.height / gridSize));
        
        const totalCompartments = rows * cols;
        
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
            borderRadius: '4px'
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
                    border: hasItem ? '2px solid #00BCD4' : '1px dashed #00BCD4',
                    borderRadius: '4px',
                    backgroundColor: hasItem ? '#E0F7FA' : 'rgba(255, 255, 255, 0.8)',
                    boxShadow: hasItem ? '0 2px 4px rgba(0, 188, 212, 0.2), inset 0 1px 0 rgba(255,255,255,0.5)' : 'inset 0 1px 2px rgba(0, 188, 212, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.6rem',
                    color: '#006064',
                    fontWeight: 'bold',
                    position: 'relative',
                    minHeight: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    ':hover': {
                      backgroundColor: hasItem ? '#B2EBF2' : 'rgba(224, 247, 250, 0.6)',
                      borderColor: '#00ACC1'
                    }
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = hasItem ? '#B2EBF2' : 'rgba(224, 247, 250, 0.9)';
                    e.target.style.borderColor = '#00ACC1';
                    e.target.style.transform = 'scale(1.05)';
                    e.target.style.boxShadow = hasItem ? '0 4px 8px rgba(0, 188, 212, 0.3), inset 0 1px 0 rgba(255,255,255,0.7)' : '0 2px 6px rgba(0, 188, 212, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = hasItem ? '#E0F7FA' : 'rgba(255, 255, 255, 0.8)';
                    e.target.style.borderColor = hasItem ? '#00BCD4' : '#00BCD4';
                    e.target.style.transform = 'scale(1)';
                    e.target.style.boxShadow = hasItem ? '0 2px 4px rgba(0, 188, 212, 0.2), inset 0 1px 0 rgba(255,255,255,0.5)' : 'inset 0 1px 2px rgba(0, 188, 212, 0.1)';
                  }}
                  title={hasItem ? `Location ID: ${hasItem.locationId || hasItem.uniqueId}\nSKU: ${hasItem.sku || 'N/A'}\nStatus: ${hasItem.status || 'planned'}\nCategory: ${hasItem.category || 'none'}\n(Click to edit, Right-click to delete)` : `Empty compartment ${row + 1}-${col + 1} (Click to add item)`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onUpdate) {
                      if (hasItem) {
                        // Edit existing Location ID
                        const newLocationId = prompt(`Edit Location ID for compartment ${row + 1}-${col + 1}:`, hasItem.locationId || hasItem.uniqueId);
                        if (newLocationId && newLocationId.trim() && newLocationId !== (hasItem.locationId || hasItem.uniqueId)) {
                          const newContents = { ...item.compartmentContents };
                          newContents[compartmentId] = { 
                            ...hasItem, 
                            locationId: newLocationId.trim(),
                            lastModified: new Date().toISOString()
                          };
                          onUpdate(item.id, { compartmentContents: newContents });
                        }
                      } else {
                        // Request SKU ID selection through callback
                        if (onRequestSkuId) {
                          onRequestSkuId(item.id, compartmentId, row, col);
                        }
                      }
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
                          const displayId = hasItem.locationId || hasItem.uniqueId || hasItem.sku;
                          return displayId.length > 8 ? displayId.substring(0, 8) + '...' : displayId;
                        })()}
                      </div>
                    ) : (
                      <div style={{
                        width: '10px',
                        height: '10px',
                        backgroundColor: '#00BCD4',
                        borderRadius: '3px',
                        border: '1px solid #006064',
                        boxShadow: '0 1px 2px rgba(0, 96, 100, 0.3)'
                      }} />
                    )
                  ) : (
                    <div style={{
                      fontSize: '0.8rem',
                      color: '#00BCD4',
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

      {/* Info Button - Hidden for square boundary and SKU components to keep them clean */}
      {item.type !== 'square_boundary' && item.type !== 'sku_holder' && !(item.type === 'storage_unit' && item.skuGrid) && (
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

      {/* Hide text content for square boundary and SKU components - keep them clean */}
      {item.type !== 'square_boundary' && item.type !== 'sku_holder' && !(item.type === 'storage_unit' && item.skuGrid) && (
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
      
      {item.type !== 'square_boundary' && item.type !== 'sku_holder' && !(item.type === 'storage_unit' && item.skuGrid) && item.label && (
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

      {/* Stack mode indicator - Hidden for square boundary and SKU components */}
      {item.type !== 'square_boundary' && item.type !== 'sku_holder' && !(item.type === 'storage_unit' && item.skuGrid) && stackMode === 'enabled' && isStackable && (
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

      {/* Status and Utilization Indicators - Hidden for square boundary and SKU components */}
      {item.type !== 'square_boundary' && item.type !== 'sku_holder' && !(item.type === 'storage_unit' && item.skuGrid) && (
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

      {/* Real-time status pulse for active locations - Hidden for square boundary and SKU components */}
      {item.type !== 'square_boundary' && item.type !== 'sku_holder' && !(item.type === 'storage_unit' && item.skuGrid) && item.inventoryData && item.inventoryData.lastActivity && 
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

export default WarehouseItem;
