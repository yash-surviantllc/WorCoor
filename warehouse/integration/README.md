# Integration Package for External Dashboard

This directory contains standalone entry points for integrating WorCoor features into external dashboards.

## Quick Start

### Option 1: Use Existing App.js (Recommended)

The existing `App.js` already supports both Layout Builder and Warehouse Maps. Simply control which view to show:

```javascript
import App from './worcoor/App';
import MainDashboard from './worcoor/components/MainDashboard';

// For Layout Builder
<App showMainDashboard={false} />

// For Warehouse Maps
<MainDashboard onNavigateToBuilder={handleNavigateToBuilder} />
```

### Option 2: Use Wrapper Components

Create wrapper components that handle navigation:

```javascript
// LayoutBuilderWrapper.js
import React from 'react';
import App from './worcoor/App';

const LayoutBuilderWrapper = ({ onBack }) => {
  return (
    <div>
      {onBack && <button onClick={onBack}>← Back</button>}
      <App showMainDashboard={false} />
    </div>
  );
};

export default LayoutBuilderWrapper;
```

## Files Structure

```
integration/
├── README.md                    (This file)
├── LayoutBuilderWrapper.js      (Wrapper for Layout Builder)
├── WarehouseMapWrapper.js       (Wrapper for Warehouse Maps)
└── integration-example.js       (Example implementation)
```

## Key Features

### Layout Builder
- Complete warehouse layout design tool
- Drag-and-drop components
- Save/Load layouts
- Export to PNG/SVG/PDF
- Undo/Redo functionality
- Grid and snap features

### Warehouse Maps
- View saved layouts
- Search and filter
- Live preview
- Fullscreen mode
- Edit existing layouts
- Operational status tracking

## Data Persistence

Both features use localStorage for data persistence:

```javascript
// Saved layouts
localStorage.getItem('warehouseLayouts')

// Layout being edited
localStorage.getItem('loadLayoutData')
```

## Events

Listen for layout changes:

```javascript
window.addEventListener('layoutSaved', () => {
  // Refresh warehouse maps view
});
```

## Dependencies

Ensure these are installed in your project:
- react ^18.2.0
- react-dom ^18.2.0
- react-dnd ^16.0.1
- react-dnd-html5-backend ^16.0.1
- react-feather ^2.0.10
- styled-components ^6.1.19
- uuid ^9.0.0

## CSS

Import the main CSS file:

```javascript
import './worcoor/index.css';
```

## Example Integration

See `integration-example.js` for a complete example of integrating both features into a dashboard.
