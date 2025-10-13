import React, { useState, useCallback, useRef } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { v4 as uuidv4 } from 'uuid';
import WarehouseToolbar from './WarehouseToolbar';
import WarehousePalette from './WarehousePalette';
import WarehousePropertiesPanel from './WarehousePropertiesPanel';
import WarehouseDesignerCanvas from './WarehouseDesignerCanvas';

const WarehouseDesigner = ({ onBack }) => {
  const [items, setItems] = useState([]);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [mode, setMode] = useState('boundary'); // boundary, zone, unit
  const [showProperties, setShowProperties] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [boundaryCreated, setBoundaryCreated] = useState(false);
  const canvasRef = useRef(null);

  const selectedItem = items.find(item => item.id === selectedItemId);
  const selectedZone = items.find(item => item.id === selectedItemId && item.containerLevel === 2);

  // Create warehouse boundary
  const handleCreateBoundary = useCallback(() => {
    if (boundaryCreated) {
      alert('Warehouse boundary already exists');
      return;
    }

    const boundary = {
      id: uuidv4(),
      type: 'warehouse_boundary',
      name: 'Warehouse 1',
      x: 50,
      y: 50,
      width: 800,
      height: 500,
      color: '#263238',
      containerLevel: 1,
      isContainer: true,
      containerPadding: 20,
      resizable: true
    };

    setItems(prev => [...prev, boundary]);
    setBoundaryCreated(true);
    setMode('zone');
  }, [boundaryCreated]);

  // Add item to canvas
  const handleAddItem = useCallback((item, x, y) => {
    // Find container if dropping into one
    let containerId = null;
    let finalX = x;
    let finalY = y;

    if (item.type !== 'warehouse_boundary') {
      const container = items.find(existing => {
        if (!existing.isContainer) return false;
        return x >= existing.x && x <= existing.x + existing.width &&
               y >= existing.y && y <= existing.y + existing.height;
      });

      if (container) {
        containerId = container.id;
        // Ensure item stays within container bounds
        const padding = container.containerPadding || 10;
        finalX = Math.max(container.x + padding, Math.min(x, container.x + container.width - padding - (item.width || 100)));
        finalY = Math.max(container.y + padding, Math.min(y, container.y + container.height - padding - (item.height || 80)));
      }
    }

    // Auto-label zones
    let itemName = item.name;
    if (item.type === 'zone' && item.id === 'storage') {
      const storageZones = items.filter(i => i.type === 'zone' && i.zoneType === 'storage');
      const nextLabel = String.fromCharCode(65 + storageZones.length); // A, B, C...
      itemName = `Storage Zone ${nextLabel}`;
    }

    const newItem = {
      id: uuidv4(),
      type: item.type || 'zone',
      name: itemName,
      x: finalX,
      y: finalY,
      width: item.type === 'zone' ? 120 : 25,
      height: item.type === 'zone' ? 200 : 25,
      color: item.color,
      containerLevel: item.type === 'zone' ? 2 : 3,
      isContainer: item.type === 'zone',
      containerPadding: item.type === 'zone' ? 8 : 0,
      zoneType: item.id,
      containerId: containerId,
      label: item.type === 'zone' && item.id === 'storage' ? String.fromCharCode(65 + items.filter(i => i.type === 'zone' && i.zoneType === 'storage').length) : null
    };

    setItems(prev => [...prev, newItem]);
  }, [items]);

  // Move item
  const handleMoveItem = useCallback((itemId, x, y) => {
    setItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, x, y } : item
    ));
  }, []);

  // Select item
  const handleSelectItem = useCallback((itemId) => {
    setSelectedItemId(itemId);
  }, []);

  // Update item properties
  const handleUpdateItem = useCallback((itemId, updates) => {
    setItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, ...updates } : item
    ));
  }, []);

  // Delete item
  const handleDeleteItem = useCallback((itemId) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
    if (selectedItemId === itemId) {
      setSelectedItemId(null);
    }
  }, [selectedItemId]);

  // Mode change handler
  const handleModeChange = useCallback((newMode) => {
    if (newMode === 'boundary') {
      handleCreateBoundary();
    } else {
      setMode(newMode);
    }
  }, [handleCreateBoundary]);

  // Auto-fill zone with units
  const handleAutoFillZone = useCallback((zoneId) => {
    const zone = items.find(item => item.id === zoneId);
    if (!zone || !zone.isContainer) return;

    // Create 3x9 grid of units like in reference image
    const units = [];
    const unitWidth = 25;
    const unitHeight = 25;
    const spacing = 2;
    const startX = zone.x + zone.containerPadding;
    const startY = zone.y + zone.containerPadding;

    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 3; col++) {
        const x = startX + col * (unitWidth + spacing);
        const y = startY + row * (unitHeight + spacing);

        // Check if unit fits within zone
        if (x + unitWidth <= zone.x + zone.width - zone.containerPadding &&
            y + unitHeight <= zone.y + zone.height - zone.containerPadding) {
          
          units.push({
            id: uuidv4(),
            type: 'unit',
            name: `Unit ${zone.label}${units.length + 1}`,
            x: x,
            y: y,
            width: unitWidth,
            height: unitHeight,
            color: '#00BCD4',
            containerLevel: 3,
            containerId: zoneId,
            unitType: 'storage_bay'
          });
        }
      }
    }

    setItems(prev => [...prev, ...units]);
  }, [items]);

  // Canvas click handler
  const handleCanvasClick = useCallback(() => {
    setSelectedItemId(null);
  }, []);

  // Save layout
  const handleSave = useCallback(() => {
    const layoutData = {
      items: items,
      metadata: {
        created: new Date().toISOString(),
        version: '1.0'
      }
    };
    
    const dataStr = JSON.stringify(layoutData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'warehouse-layout.json';
    link.click();
    
    URL.revokeObjectURL(url);
  }, [items]);

  const containerStyle = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#161b22',
    color: '#ffffff'
  };

  const mainContentStyle = {
    display: 'flex',
    flex: 1,
    overflow: 'hidden'
  };

  const canvasContainerStyle = {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#0d1117',
    border: '1px solid #21262d',
    borderRadius: '0.5rem'
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={containerStyle}>
        {/* Top Toolbar */}
        <WarehouseToolbar
          onCreateBoundary={handleCreateBoundary}
          onAddZone={() => setMode('zone')}
          onAddUnits={() => setMode('unit')}
          onShowProperties={() => setShowProperties(true)}
          onSave={handleSave}
          selectedZone={selectedZone}
          mode={mode}
          onModeChange={handleModeChange}
          onBack={onBack}
        />

        <div style={mainContentStyle}>
          {/* Left Sidebar - Component Palette */}
          <WarehousePalette
            mode={mode}
            onComponentSelect={() => {}}
          />

          {/* Main Canvas Area */}
          <div style={canvasContainerStyle}>
            <WarehouseDesignerCanvas
              ref={canvasRef}
              items={items}
              selectedItemId={selectedItemId}
              mode={mode}
              zoomLevel={zoomLevel}
              panOffset={panOffset}
              onAddItem={handleAddItem}
              onMoveItem={handleMoveItem}
              onSelectItem={handleSelectItem}
              onCanvasClick={handleCanvasClick}
              onAutoFillZone={handleAutoFillZone}
            />
          </div>

          {/* Right Properties Panel */}
          <WarehousePropertiesPanel
            selectedItem={selectedItem}
            onUpdateItem={handleUpdateItem}
            onClose={() => setShowProperties(false)}
            isVisible={showProperties}
          />
        </div>
      </div>
    </DndProvider>
  );
};

export default WarehouseDesigner;
