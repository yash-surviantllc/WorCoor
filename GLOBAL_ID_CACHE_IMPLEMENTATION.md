# Global ID Cache Implementation

## Overview
Implemented a global ID cache system to ensure unique location IDs across the entire warehouse map. This prevents duplicate IDs from being assigned to different cells/compartments anywhere in the layout.

## How It Works

### 1. **Global ID Cache Utility** (`src/utils/globalIdCache.js`)
- **Singleton Pattern**: Single instance shared across the entire application
- **Automatic Extraction**: Scans all layout items and extracts location IDs from:
  - Direct properties: `locationId`, `locationCode`, `locationTag`, `primaryLocationId`
  - Nested properties: `locationData.location_id`, `properties.locationId`, `data.locationId`
  - Arrays: `locationIds[]`, `levelLocationMappings[]`
  - Compartment contents: All location IDs within `compartmentContents` objects
- **Normalized Storage**: All IDs are stored in uppercase for case-insensitive comparison

### 2. **Lifecycle Management**

#### **Initialization** (When entering layout builder)
```javascript
// In WarehouseDesigner.js
useEffect(() => {
  globalIdCache.initialize(items);
  console.log(`Global ID cache initialized with ${globalIdCache.size()} IDs`);
  
  return () => {
    globalIdCache.clear(); // Cleanup on unmount
  };
}, []);
```

#### **Updates** (When items change)
```javascript
useEffect(() => {
  if (globalIdCache.isInitialized()) {
    globalIdCache.initialize(items); // Re-scan all items
  }
}, [items]);
```

#### **Cleanup** (When saving)
```javascript
// In handleSave()
globalIdCache.clear();
showMessage.success('Layout saved successfully! ID cache cleared.');
```

### 3. **Validation Points**

All location ID assignments are now validated against the global cache:

#### **A. Adding New Items** (`WarehouseDesigner.js`)
```javascript
const handleAddItem = (item, x, y) => {
  const locationId = item.locationId || ...;
  
  if (locationId && globalIdCache.isIdInUse(locationId)) {
    showMessage.error(`Cannot add item: Location ID ${locationId} is already in use`);
    return;
  }
  // ... add item
};
```

#### **B. Updating Existing Items** (`WarehouseDesigner.js`)
```javascript
const handleUpdateItem = (itemId, updatedProps) => {
  const newLocationId = updatedProps.locationId || ...;
  
  if (newLocationId && globalIdCache.isIdInUse(newLocationId)) {
    showMessage.error(`Location ID ${newLocationId} is already in use`);
    return prevItems; // Prevent update
  }
  // ... update item
};
```

#### **C. SKU Compartments** (`PropertiesPanel.js`)
```javascript
const updateSkuMetadata = (compartmentId, updates) => {
  if (updates.locationId) {
    const oldLocationId = currentSku.locationId || currentSku.uniqueId;
    const newLocationId = updates.locationId;
    
    // Check if new ID is already in use
    if (globalIdCache.isIdInUse(newLocationId)) {
      showMessage.error(`Location ID "${newLocationId}" is already in use elsewhere in the map`);
      return;
    }
    
    // Update cache: remove old, add new
    if (oldLocationId) {
      globalIdCache.removeId(oldLocationId);
    }
    globalIdCache.addId(newLocationId);
  }
  // ... update compartment
};
```

#### **D. SKU ID Selector** (`SkuIdSelector.js`)
```javascript
const generateAvailableLocationIds = () => {
  const allIds = [];
  for (let i = 1; i <= 999; i++) {
    const locationId = `LOC-${i.toString().padStart(3, '0')}`;
    // Check both local and global cache
    if (!existingLocationIds.includes(locationId) && !globalIdCache.isIdInUse(locationId)) {
      allIds.push(locationId);
    }
  }
  return allIds;
};
```

#### **E. Multi-Location Selector** (`MultiLocationSelector.js`)
```javascript
const handleAttachMapping = () => {
  const locationId = normalizeLocationId(locationSelectValue);
  
  // Check against global cache
  if (globalIdCache.isIdInUse(locationId)) {
    showMessage.error(`Location ID ${locationId} is already in use elsewhere in the map`);
    return;
  }
  
  // Add to cache when saving
  globalIdCache.addId(locationId);
  // ... attach mapping
};
```

#### **F. Warehouse Properties Panel** (`WarehousePropertiesPanel.js`)
```javascript
const isLocationAvailable = (locationId) => {
  // Check both local and global cache
  const isUsedLocally = usedLocationIds.has(String(locationId).trim());
  const isUsedGlobally = globalIdCache.isIdInUse(locationId);
  
  // Allow reuse of current item's ID
  if (currentLocationId && String(currentLocationId).trim().toUpperCase() === String(locationId).trim().toUpperCase()) {
    return true;
  }
  
  return !isUsedLocally && !isUsedGlobally;
};
```

### 4. **Deletion Handling**

When items are deleted, their IDs are removed from the cache:

```javascript
const handleDeleteItem = (itemId) => {
  const itemToDelete = items.find(item => item.id === itemId);
  if (itemToDelete) {
    // Remove all location IDs from the item
    const idsToRemove = [
      itemToDelete.locationId,
      itemToDelete.locationCode,
      // ... all ID fields
    ];
    
    idsToRemove.forEach(id => {
      if (id) globalIdCache.removeId(id);
    });
    
    // Remove from arrays and compartments
    // ...
  }
  
  setItems(prev => prev.filter(item => item.id !== itemId));
};
```

## Benefits

1. **Map-Wide Uniqueness**: No duplicate IDs across the entire warehouse layout
2. **Real-Time Validation**: Immediate feedback when attempting to use duplicate IDs
3. **Automatic Management**: Cache is automatically initialized, updated, and cleared
4. **Performance**: O(1) lookup time using Set data structure
5. **Comprehensive Coverage**: Validates IDs from all sources (direct properties, compartments, multi-location mappings)

## User Experience

### Before
- User could assign "LOC-001" to multiple cells in different components
- Duplicate IDs only detected within the same component
- Confusion when searching for locations

### After
- User attempts to assign "LOC-001" to a second location
- System immediately shows error: "Location ID 'LOC-001' is already in use elsewhere in the map"
- User must choose a different ID
- All location IDs are guaranteed unique across the entire map

## Cache Lifecycle

```
┌─────────────────────────────────────────────────────────────┐
│                    Layout Builder Opened                     │
│                  globalIdCache.initialize()                  │
│              Scans all items, extracts all IDs               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    User Edits Layout                         │
│   - Add/Update/Delete items → Cache updated automatically   │
│   - All ID assignments validated against cache              │
│   - Duplicate IDs rejected with error message               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    User Saves Layout                         │
│                   globalIdCache.clear()                      │
│              Cache destroyed, ready for next edit            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              User Opens Layout for Editing Again             │
│                  globalIdCache.initialize()                  │
│            Fresh cache built from saved layout data          │
└─────────────────────────────────────────────────────────────┘
```

## Testing Checklist

- [ ] Open layout builder with existing layout
- [ ] Verify cache initializes with all existing IDs
- [ ] Try to add a compartment with duplicate ID → Should show error
- [ ] Try to edit a compartment to use duplicate ID → Should show error
- [ ] Delete a compartment → ID should be removed from cache and become available
- [ ] Add multi-location component with duplicate ID → Should show error
- [ ] Save layout → Cache should be cleared
- [ ] Re-open layout → Cache should reinitialize with all IDs

## Files Modified

1. **Created**: `src/utils/globalIdCache.js` - Core cache implementation
2. **Modified**: `src/components/WarehouseDesigner.js` - Cache initialization and lifecycle
3. **Modified**: `src/components/PropertiesPanel.js` - Compartment ID validation
4. **Modified**: `src/components/SkuIdSelector.js` - Available ID generation
5. **Modified**: `src/components/MultiLocationSelector.js` - Multi-location validation
6. **Modified**: `src/components/WarehousePropertiesPanel.js` - Location ID validation

## API Reference

### `globalIdCache.initialize(items)`
Initialize cache with all IDs from layout items.

### `globalIdCache.isIdInUse(id)`
Check if an ID is already in use (returns boolean).

### `globalIdCache.addId(id)`
Add an ID to the cache.

### `globalIdCache.removeId(id)`
Remove an ID from the cache.

### `globalIdCache.updateId(oldId, newId)`
Update an ID in the cache (returns false if newId already exists).

### `globalIdCache.clear()`
Clear the entire cache.

### `globalIdCache.size()`
Get the number of IDs in the cache.

### `globalIdCache.isInitialized()`
Check if cache has been initialized.

### `globalIdCache.getAllIds()`
Get all IDs in the cache (for debugging).
