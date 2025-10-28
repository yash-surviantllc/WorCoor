import React, { forwardRef, useCallback, useState } from 'react';
import { useDrop } from 'react-dnd';
import { getComponentColor } from '../utils/componentColors';

const WarehouseItem = ({ 
  item, 
  items,
  zoomLevel,
  panOffset,
  showLabels,
  isSelected, 
  isZoneSelected, 
  mode, 
  onSelect, 
  onMove, 
  onAutoFill 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragPreview, setDragPreview] = useState({ x: 0, y: 0 });
  const [lastUpdateTime, setLastUpdateTime] = useState(0);

  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Only left click
    
    // Get canvas bounds for proper coordinate calculation
    const canvas = e.currentTarget.closest('.warehouse-canvas') || e.currentTarget.parentElement;
    const canvasRect = canvas.getBoundingClientRect();
    
    // Calculate initial offset accounting for zoom and pan
    const canvasX = (e.clientX - canvasRect.left - panOffset.x) / zoomLevel;
    const canvasY = (e.clientY - canvasRect.top - panOffset.y) / zoomLevel;
    
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setDragOffset({ 
      x: canvasX - item.x, 
      y: canvasY - item.y 
    });
    setDragPreview({ x: item.x, y: item.y });
    
    onSelect(item.id);
    e.preventDefault();
    e.stopPropagation();
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    
    // Get canvas bounds for proper coordinate calculation
    const canvas = document.querySelector('.warehouse-canvas');
    if (!canvas) return;
    
    const canvasRect = canvas.getBoundingClientRect();
    
    // Calculate new position accounting for zoom and pan transformations
    const canvasX = (e.clientX - canvasRect.left - panOffset.x) / zoomLevel;
    const canvasY = (e.clientY - canvasRect.top - panOffset.y) / zoomLevel;
    
    // Apply drag offset to get final position
    const newX = Math.max(0, canvasX - dragOffset.x);
    const newY = Math.max(0, canvasY - dragOffset.y);
    
    // Update preview position for smooth visual feedback
    setDragPreview({ x: newX, y: newY });
    
    // Apply optional grid snapping for real-time feedback
    const gridSize = 15; // Use sub-grid for smooth positioning
    const snappedX = Math.round(newX / gridSize) * gridSize;
    const snappedY = Math.round(newY / gridSize) * gridSize;
    
    // Throttle updates for better performance
    const now = Date.now();
    if (now - lastUpdateTime > 16) { // ~60fps throttling
      setLastUpdateTime(now);
      // Use requestAnimationFrame for smooth updates
      requestAnimationFrame(() => {
        onMove(item.id, snappedX, snappedY);
      });
    }
  }, [isDragging, dragOffset, panOffset, zoomLevel, item.id, onMove, lastUpdateTime]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      setDragPreview({ x: 0, y: 0 });
      
      // Final position snap to ensure precision
      const gridSize = 15;
      const finalX = Math.round(dragPreview.x / gridSize) * gridSize;
      const finalY = Math.round(dragPreview.y / gridSize) * gridSize;
      
      // Ensure final position is within bounds
      onMove(item.id, Math.max(0, finalX), Math.max(0, finalY));
    }
  }, [isDragging, dragPreview, item.id, onMove]);

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  const handleDoubleClick = () => {
    if (item.containerLevel === 2 && item.isContainer) {
      onAutoFill(item.id);
    }
  };

  // Determine item state and styling
  const isZone = item.containerLevel === 2;
  const isUnit = item.containerLevel === 3;
  const isBoundary = item.containerLevel === 1;
  const isStorageRack = item.type === 'sku_holder'; // Horizontal storage racks (SKU holders)
  const isVerticalStorageRack = item.type === 'vertical_sku_holder'; // Vertical storage racks
  const isStorageUnit = item.type === 'storage_unit'; // Storage units
  
  // Zone selection states
  let zoneState = 'inactive';
  if (isZone) {
    if (isSelected) zoneState = 'selected';
    else if (isZoneSelected && mode === 'unit') zoneState = 'receiving';
  }

  const getItemStyle = () => {
    let baseStyle = {
      position: 'absolute',
      left: item.x,
      top: item.y,
      width: item.width,
      height: item.height,
      cursor: isDragging ? 'grabbing' : 'grab',
      opacity: isDragging ? 0.8 : 1,
      transform: isDragging ? 'scale(1.02)' : 'scale(1)',
      transition: isDragging ? 'none' : 'transform 0.2s ease, opacity 0.2s ease',
      zIndex: isDragging ? 1000 : 'auto',
      userSelect: 'none',
      boxSizing: 'border-box',
      overflow: 'visible' // Allow labels to appear outside component boundaries
    };

    if (isBoundary) {
      return {
        ...baseStyle,
        border: '3px solid #263238',
        backgroundColor: 'rgba(38, 50, 56, 0.05)',
        borderRadius: '8px'
      };
    }

    if (isZone) {
      const fixedColor = getComponentColor(item.type);
      let borderColor = fixedColor;
      let backgroundColor = fixedColor;
      let borderWidth = '2px';
      let borderStyle = 'solid';

      // Zone state styling
      if (zoneState === 'selected') {
        borderColor = fixedColor;
        borderWidth = '3px';
        backgroundColor = fixedColor;
      } else if (zoneState === 'receiving') {
        borderColor = fixedColor;
        borderWidth = '2px';
        borderStyle = 'dashed';
        backgroundColor = `${fixedColor}40`; // Semi-transparent
      }

      return {
        ...baseStyle,
        border: `${borderWidth} ${borderStyle} ${borderColor}`,
        backgroundColor: backgroundColor,
        borderRadius: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      };
    }

    // Horizontal Storage Racks - Black borders with blue interior
    if (isStorageRack) {
      return {
        ...baseStyle,
        border: '2px solid #000000 !important', // Black border for horizontal storage racks
        borderStyle: 'solid !important', // Force solid border style
        backgroundColor: 'rgba(33, 150, 243, 0.15)', // Light blue background
        borderRadius: '4px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.2)' // Subtle shadow
      };
    }

    // Vertical Storage Racks - Orange borders with orange interior
    if (isVerticalStorageRack) {
      return {
        ...baseStyle,
        border: '2px solid #FF9800 !important', // Orange border for vertical storage racks
        borderStyle: 'solid !important', // Force solid border style
        backgroundColor: '#FF9800', // Orange background
        borderRadius: '4px',
        boxShadow: '0 1px 3px rgba(255, 152, 0, 0.3)' // Orange shadow
      };
    }

    // Storage Units - Use dynamic color based on category
    if (isStorageUnit) {
      const storageUnitColor = getComponentColor(item.type, item.category);
      const borderColor = storageUnitColor === '#4CAF50' ? '#388E3C' : storageUnitColor;
      
      return {
        ...baseStyle,
        border: `2px solid ${borderColor} !important`, // Dynamic border color
        borderStyle: 'solid !important', // Force solid border style
        backgroundColor: storageUnitColor, // Use the actual component color
        borderRadius: '4px',
        boxShadow: `0 1px 3px ${borderColor}33` // Dynamic shadow with transparency
      };
    }

    // Other units (fallback) - Force solid borders for all units
    if (isUnit) {
      return {
        ...baseStyle,
        border: '2px solid #00BCD4 !important',
        borderStyle: 'solid !important', // Force solid border style
        backgroundColor: '#E0F7FA',
        borderRadius: '2px'
      };
    }

    return baseStyle;
  };

  const renderLabel = () => {
    if (!showLabels) return null;
    
    const getSmartLabel = () => {
      // For storage components, only show label if locationId is assigned
      const isStorageComponent = item.type === 'storage_unit' || item.type === 'sku_holder' || item.type === 'vertical_sku_holder';
      
      if (isStorageComponent) {
        // Only show locationId for storage components, nothing else
        return item.locationId || null;
      }
      
      // For other components: Priority: custom label > locationTag > name > auto-generated
      if (item.label && item.label.trim() && item.label !== item.name) return item.label.trim();
      if (item.locationTag && item.locationTag.trim()) return item.locationTag.trim();
      
      // Auto-generate label based on type for non-storage components
      const typeLabels = {
        'warehouse_block': 'BLOCK',
        'storage_zone': 'ZONE',
        'processing_area': 'PROC',
        'container_unit': 'UNIT',
        'zone_divider': 'DIV',
        'area_boundary': 'AREA',
        'square_boundary': 'BOUND',
        'solid_boundary': 'WALL',
        'dotted_boundary': 'LINE'
      };
      
      const prefix = typeLabels[item.type];
      if (!prefix) return null;
      
      const sameTypeItems = items.filter(i => i.type === item.type);
      const index = sameTypeItems.indexOf(item) + 1;
      
      // Use letters for zones, numbers for others
      if (isZone && index <= 26) {
        return String.fromCharCode(64 + index); // A, B, C, etc.
      }
      
      return `${prefix}-${index.toString().padStart(2, '0')}`;
    };

    const label = getSmartLabel();
    if (!label) return null;
    
    // Unified label positioning - ALL labels appear below components
    const getUnifiedLabelStyle = () => {
      const baseStyle = {
        position: 'absolute',
        top: '100%', // Position at the bottom of the component
        left: '50%', // Center horizontally
        marginTop: '8px', // Add space below the component
        transform: 'translateX(-50%)',
        pointerEvents: 'none',
        userSelect: 'none',
        fontFamily: 'Arial, sans-serif',
        whiteSpace: 'nowrap',
        zIndex: 15,
        textAlign: 'center'
      };

      // Zone labels - larger and more prominent
      if (isZone) {
        const fontSize = Math.min(Math.max(item.width / 10, 14), 18);
        const padding = Math.max(fontSize * 0.3, 4);
        
        return {
          ...baseStyle,
          fontSize: `${fontSize}px`,
          fontWeight: 'bold',
          color: '#2c3e50',
          backgroundColor: 'rgba(52, 152, 219, 0.2)',
          padding: `${padding}px ${padding * 2}px`,
          borderRadius: '8px',
          border: '2px solid #3498db',
          boxShadow: '0 2px 6px rgba(52, 152, 219, 0.3)',
          minWidth: '70px'
        };
      }

      // Boundary labels - distinctive styling
      if (isBoundary) {
        const fontSize = Math.min(Math.max(item.width / 15, 10), 14);
        const padding = Math.max(fontSize * 0.3, 2);
        
        return {
          ...baseStyle,
          fontSize: `${fontSize}px`,
          fontWeight: '600',
          color: '#34495e',
          backgroundColor: 'rgba(149, 165, 166, 0.15)',
          padding: `${padding}px ${padding * 2}px`,
          borderRadius: '6px',
          border: '1px solid #95a5a6',
          boxShadow: '0 2px 4px rgba(149, 165, 166, 0.2)',
          minWidth: '50px'
        };
      }

      // Storage unit labels - clean and compact
      const fontSize = Math.min(Math.max(item.width / 8, 10), 14);
      const padding = Math.max(fontSize * 0.3, 3);
      
      return {
        ...baseStyle,
        fontSize: `${fontSize}px`,
        fontWeight: '600',
        color: '#16a085',
        backgroundColor: 'rgba(26, 188, 156, 0.15)',
        padding: `${padding}px ${padding * 1.5}px`,
        borderRadius: '5px',
        border: '1px solid #1abc9c',
        boxShadow: '0 1px 3px rgba(26, 188, 156, 0.2)',
        minWidth: '50px'
      };
    };

    // Always show labels for all components
    const shouldShowLabel = () => {
      return true; // Always show labels regardless of zoom level
    };

    if (!shouldShowLabel() || !showLabels) return null;
    
    return (
      <div 
        style={getUnifiedLabelStyle()}
        title={`${item.name || item.type} - ${label}`}
      >
        {label}
      </div>
    );
  };

  const renderZoneTypeLabel = () => {
    if (!isZone || item.zoneType === 'storage') return null;
    
    const typeLabels = {
      receiving: 'Receiving',
      dispatch: 'Dispatch', 
      office: 'Office',
      transit: 'Transit/Temp'
    };

    return (
      <div style={{
        fontSize: '0.8rem',
        fontWeight: 'bold',
        color: '#333',
        textAlign: 'center',
        pointerEvents: 'none'
      }}>
        {typeLabels[item.zoneType]}
        {item.label && (
          <div style={{ fontSize: '1.2rem', marginTop: '2px' }}>
            {item.label}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{
      position: 'absolute',
      left: item.x,
      top: item.y,
      width: item.width,
      height: 'auto', // Allow container to expand for label
      pointerEvents: 'none' // Let clicks pass through to component
    }}>
      {/* Main Component */}
      <div
        className={`warehouse-component ${isStorageRack ? 'storage-rack' : ''} ${isVerticalStorageRack ? 'vertical-storage-rack' : ''} ${isStorageUnit ? 'storage-unit' : ''} ${isUnit ? 'storage-component' : ''} ${isDragging ? 'dragging' : ''}`}
        style={{
          ...getItemStyle(),
          position: 'relative', // Change to relative since parent handles absolute positioning
          left: 0,
          top: 0,
          pointerEvents: 'auto' // Re-enable pointer events for the actual component
        }}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        title={`${item.name} (${item.type})`}
      >
        {renderZoneTypeLabel()}
        
        {/* Zone state indicators */}
        {isZone && zoneState === 'receiving' && (
          <div style={{
            position: 'absolute',
            top: '-20px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#28a745',
            color: 'white',
            padding: '2px 8px',
            borderRadius: '4px',
            fontSize: '10px',
            fontWeight: 'bold'
          }}>
            DROP UNITS HERE
          </div>
        )}
      </div>
      
      {/* Label positioned below component */}
      {renderLabel()}
    </div>
  );
};

const WarehouseDesignerCanvas = forwardRef(({ 
  items, 
  selectedItemId, 
  mode, 
  zoomLevel, 
  panOffset, 
  showLabels,
  onAddItem, 
  onMoveItem, 
  onSelectItem, 
  onCanvasClick,
  onAutoFillZone 
}, ref) => {
  const selectedZone = items.find(item => item.id === selectedItemId && item.containerLevel === 2);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'component',
    drop: (item, monitor) => {
      const offset = monitor.getClientOffset();
      const canvasRect = ref.current?.getBoundingClientRect();
      
      if (offset && canvasRect) {
        const x = (offset.x - canvasRect.left - panOffset.x) / zoomLevel;
        const y = (offset.y - canvasRect.top - panOffset.y) / zoomLevel;
        onAddItem(item, x, y);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }));

  const canvasStyle = {
    width: '100%',
    height: '100%',
    position: 'relative',
    overflow: 'visible', // Allow labels to extend beyond canvas
    backgroundColor: '#fafafa',
    backgroundImage: `
      linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
    `,
    backgroundSize: `${20 * zoomLevel}px ${20 * zoomLevel}px`,
    backgroundPosition: `${panOffset.x}px ${panOffset.y}px`,
    cursor: mode === 'boundary' ? 'crosshair' : 'default',
    // Improve rendering performance
    willChange: 'transform',
    backfaceVisibility: 'hidden',
    perspective: 1000
  };

  const canvasContentStyle = {
    transform: `scale(${zoomLevel}) translate(${panOffset.x / zoomLevel}px, ${panOffset.y / zoomLevel}px)`,
    transformOrigin: '0 0',
    width: '100%',
    height: '100%'
  };

  return (
    <div
      ref={(node) => {
        drop(node);
        if (ref) ref.current = node;
      }}
      className="warehouse-canvas"
      style={canvasStyle}
      onClick={onCanvasClick}
    >
      <div style={canvasContentStyle}>
        {/* Render all items */}
        {items.map(item => (
          <WarehouseItem
            key={item.id}
            item={item}
            items={items}
            zoomLevel={zoomLevel}
            panOffset={panOffset}
            showLabels={showLabels}
            isSelected={item.id === selectedItemId}
            isZoneSelected={selectedZone?.id === item.id}
            mode={mode}
            onSelect={onSelectItem}
            onMove={onMoveItem}
            onAutoFill={onAutoFillZone}
          />
        ))}

        {/* Drop zone indicator */}
        {isOver && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 123, 255, 0.1)',
            border: '2px dashed #007bff',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            color: '#007bff',
            fontWeight: 'bold'
          }}>
            Drop component here
          </div>
        )}

        {/* Mode-specific overlays */}
        {mode === 'boundary' && !items.some(item => item.containerLevel === 1) && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            color: '#6c757d',
            fontSize: '16px'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📐</div>
            <div>Click "Create Boundary" to start</div>
            <div style={{ fontSize: '14px', marginTop: '8px' }}>
              Define your warehouse perimeter first
            </div>
          </div>
        )}

        {mode === 'zone' && items.some(item => item.containerLevel === 1) && !items.some(item => item.containerLevel === 2) && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            color: '#6c757d',
            fontSize: '16px'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📦</div>
            <div>Drag zones from the palette</div>
            <div style={{ fontSize: '14px', marginTop: '8px' }}>
              Create storage areas within your warehouse
            </div>
          </div>
        )}

        {mode === 'unit' && !selectedZone && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            color: '#6c757d',
            fontSize: '16px'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>▢</div>
            <div>Select a zone first</div>
            <div style={{ fontSize: '14px', marginTop: '8px' }}>
              Click on a zone to add storage units
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

WarehouseDesignerCanvas.displayName = 'WarehouseDesignerCanvas';

export default WarehouseDesignerCanvas;
