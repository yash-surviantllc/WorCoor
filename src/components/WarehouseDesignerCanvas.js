import React, { forwardRef, useCallback, useState } from 'react';
import { useDrop } from 'react-dnd';

const WarehouseItem = ({ 
  item, 
  isSelected, 
  isZoneSelected, 
  mode, 
  onSelect, 
  onMove, 
  onAutoFill 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    if (e.button !== 0) return; // Only left click
    setIsDragging(true);
    setDragStart({
      x: e.clientX - item.x,
      y: e.clientY - item.y
    });
    onSelect(item.id);
    e.preventDefault();
  };

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    onMove(item.id, Math.max(0, newX), Math.max(0, newY));
  }, [isDragging, dragStart, item.id, onMove]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

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
      userSelect: 'none',
      boxSizing: 'border-box'
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
      let borderColor = item.color;
      let backgroundColor = item.color;
      let borderWidth = '2px';
      let borderStyle = 'solid';

      // Zone state styling
      if (zoneState === 'selected') {
        borderColor = item.color;
        borderWidth = '3px';
        backgroundColor = item.color;
      } else if (zoneState === 'receiving') {
        borderColor = item.color;
        borderWidth = '2px';
        borderStyle = 'dashed';
        backgroundColor = `${item.color}40`; // Semi-transparent
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

    if (isUnit) {
      return {
        ...baseStyle,
        border: '1px solid #00BCD4',
        backgroundColor: '#E0F7FA',
        borderRadius: '2px'
      };
    }

    return baseStyle;
  };

  const renderZoneLabel = () => {
    if (!isZone || !item.label) return null;
    
    return (
      <div style={{
        fontSize: '2rem',
        fontWeight: 'bold',
        color: '#333',
        textShadow: '1px 1px 2px rgba(255,255,255,0.8)',
        pointerEvents: 'none'
      }}>
        {item.label}
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
    <div
      style={getItemStyle()}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      title={`${item.name} (${item.type})`}
    >
      {renderZoneLabel()}
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
  );
};

const WarehouseDesignerCanvas = forwardRef(({ 
  items, 
  selectedItemId, 
  mode, 
  zoomLevel, 
  panOffset, 
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
    overflow: 'hidden',
    backgroundColor: '#fafafa',
    backgroundImage: `
      linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
    `,
    backgroundSize: `${20 * zoomLevel}px ${20 * zoomLevel}px`,
    backgroundPosition: `${panOffset.x}px ${panOffset.y}px`,
    cursor: mode === 'boundary' ? 'crosshair' : 'default'
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
      style={canvasStyle}
      onClick={onCanvasClick}
    >
      <div style={canvasContentStyle}>
        {/* Render all items */}
        {items.map(item => (
          <WarehouseItem
            key={item.id}
            item={item}
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
