import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import { DRAG_TYPES, WAREHOUSE_COMPONENTS } from '../constants/warehouseComponents';

const DraggableComponent = ({ component }) => {
  const [{ isDragging }, drag] = useDrag({
    type: DRAG_TYPES.COMPONENT,
    item: {
      ...component,
      // Ensure all required properties are included
      type: component.type,
      name: component.name,
      icon: component.icon,
      color: component.color,
      defaultSize: component.defaultSize || { width: 50, height: 50 },
      description: component.description,
      drawingTool: component.drawingTool || false,
      priority: component.priority || 'medium'
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    canDrag: () => true,
    end: (item, monitor) => {
      // Reset any visual states after drag ends
      if (!monitor.didDrop()) {
        // Handle failed drop if needed
        console.log('Drop failed for:', item.name);
      }
    }
  });

  return (
    <div
      ref={drag}
      className={`component-item ${isDragging ? 'dragging' : ''} ${component.drawingTool ? 'drawing-tool' : ''}`}
      data-priority={component.priority || 'medium'}
      data-type={component.type}
      style={{
        backgroundColor: component.color,
        opacity: isDragging ? 0.7 : 1
      }}
      title={`${component.description}${component.priority ? ` (${component.priority} priority)` : ''}\nDrag to canvas to add`}
    >
      <div className="component-icon">{component.icon}</div>
      <div className="component-name">{component.name}</div>
      <div className="component-size">
        {component.drawingTool ? '🎨 Draw Tool' : `${component.defaultSize?.width || 50}×${component.defaultSize?.height || 50}`}
      </div>
      {component.drawingTool && (
        <div className="drawing-tool-hint">
          Drag to canvas to activate
        </div>
      )}
      {component.priority === 'high' && (
        <div className="priority-badge" style={{
          position: 'absolute',
          top: '2px',
          right: '2px',
          background: 'var(--error-500)',
          color: 'white',
          borderRadius: '50%',
          width: '8px',
          height: '8px',
          fontSize: '0.6rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}></div>
      )}
    </div>
  );
};

const ComponentCategory = ({ category, isExpanded, onToggle }) => {
  // Sort components by priority (high -> medium -> low)
  const sortedItems = [...(category.components || [])].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return (priorityOrder[a.priority] || 1) - (priorityOrder[b.priority] || 1);
  });

  return (
    <div className="component-category" data-category={category.category}>
      <div 
        className="category-header" 
        onClick={onToggle}
        style={{ cursor: 'pointer' }}
      >
        <span className="category-toggle">
          {isExpanded ? '▼' : '▶'}
        </span>
        <span className="category-title">{category.category}</span>
        <span className="category-count">({(category.components || []).length})</span>
        <div className="category-priority-indicator" style={{
          marginLeft: 'auto',
          display: 'flex',
          gap: '2px'
        }}>
          {(category.components || []).filter(item => item.priority === 'high').length > 0 && (
            <div style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: 'var(--error-500)'
            }} title="High priority items"></div>
          )}
          {(category.components || []).filter(item => item.priority === 'medium').length > 0 && (
            <div style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: 'var(--warning-500)'
            }} title="Medium priority items"></div>
          )}
          {(category.components || []).filter(item => item.priority === 'low').length > 0 && (
            <div style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: 'var(--success-500)'
            }} title="Low priority items"></div>
          )}
        </div>
      </div>
      {isExpanded && (
        <div className="category-items animate-fade-in">
          {sortedItems.map((component, index) => (
            <DraggableComponent key={index} component={component} />
          ))}
        </div>
      )}
    </div>
  );
};

const ComponentPanel = () => {
  const [expandedCategories, setExpandedCategories] = useState({
    'Storage & Inventory': false,
    'Operations': false,
    'Facilities': false,
    'Multi-Level Facilities': false,
    'Advanced Shapes': false,
    'Structure & Layout': false,
    'Traffic & Flow': false,
    'Utilities & Safety': false,
    'Shapes': false,
    'Layout Boundaries': true,
    'Zone Types': true,
    'Unit Types': true
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredComponents, setFilteredComponents] = useState(WAREHOUSE_COMPONENTS);

  const toggleCategory = (categoryName) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryName]: !prev[categoryName]
    }));
  };

  const expandAll = () => {
    const allExpanded = {};
    WAREHOUSE_COMPONENTS.forEach(cat => {
      allExpanded[cat.category] = true;
    });
    setExpandedCategories(allExpanded);
  };

  const collapseAll = () => {
    const allCollapsed = {};
    WAREHOUSE_COMPONENTS.forEach(cat => {
      allCollapsed[cat.category] = false;
    });
    setExpandedCategories(allCollapsed);
  };
  
  // Filter components based on search term
  const handleSearch = (term) => {
    setSearchTerm(term);
    if (!term.trim()) {
      setFilteredComponents(WAREHOUSE_COMPONENTS);
      return;
    }
    
    const filtered = WAREHOUSE_COMPONENTS.map(category => ({
      ...category,
      items: category.items.filter(item => 
        item.name.toLowerCase().includes(term.toLowerCase()) ||
        item.description.toLowerCase().includes(term.toLowerCase()) ||
        item.type.toLowerCase().includes(term.toLowerCase())
      )
    })).filter(category => category.items.length > 0);
    
    setFilteredComponents(filtered);
    
    // Auto-expand categories with search results
    if (term.trim()) {
      const expandedForSearch = {};
      filtered.forEach(cat => {
        expandedForSearch[cat.category] = true;
      });
      setExpandedCategories(expandedForSearch);
    }
  };

  return (
    <div className="component-panel animate-slide-right">
      <div className="panel-header">
        <h3>🏭 Components</h3>
        <div className="search-container">
          <input
            type="text"
            placeholder="🔍 Search components..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="component-search"
          />
        </div>
        <div className="panel-controls">
          <button onClick={expandAll} className="control-btn">
            📂 Expand All
          </button>
          <button onClick={collapseAll} className="control-btn">
            📁 Collapse All
          </button>
        </div>
      </div>
      
      <div className="categories-container">
        {filteredComponents.length === 0 && searchTerm ? (
          <div className="no-results">
            <div className="no-results-icon">🔍</div>
            <div className="no-results-text">No components found</div>
            <div className="no-results-hint">Try a different search term</div>
          </div>
        ) : filteredComponents.length === 0 ? (
          <div className="no-results">
            <div className="no-results-icon">📦</div>
            <div className="no-results-text">No components available</div>
            <div className="no-results-hint">Components will be added step by step</div>
          </div>
        ) : (
          filteredComponents.map((category, index) => (
            <ComponentCategory
              key={index}
              category={category}
              isExpanded={expandedCategories[category.category]}
              onToggle={() => toggleCategory(category.category)}
            />
          ))
        )}
      </div>
      
      <div className="panel-footer">
        <div className="usage-tip">
          💡 Drag components to canvas to build your warehouse layout
        </div>
      </div>
    </div>
  );
};

export default ComponentPanel;
