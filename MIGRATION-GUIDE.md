# Migration Guide

## What Changed

### ✅ Utility Consolidation
- Moved all warehouse utilities from `warehouse/utils/` to `lib/warehouse/utils/`
- Moved constants from `warehouse/constants/` to `lib/warehouse/constants/`
- Updated import paths in warehouse components

### ✅ Component Migration
- Moved dashboard components to `components/dashboard/`
- Moved warehouse view components to `components/warehouse/views/`
- Moved form components to `components/warehouse/forms/`
- Moved tool components to `components/warehouse/tools/`
- Converted `.js` files to `.tsx` for TypeScript consistency

### ✅ Reference Data Organization
- Created organized structure in `app/dashboard/reference-data/`
- Added `_components/`, `_hooks/`, `_types/` subdirectories
- Created index files for better imports

### ✅ Path Aliases
- Added TypeScript path aliases for cleaner imports
- `@/components/*` → `./components/*`
- `@/lib/*` → `./lib/*`
- `@/src/*` → `./src/*`

## How to Update Your Code

### Import Path Changes

#### Before:
```javascript
// Warehouse utilities
import { getComponentColor } from './utils/componentColors';
import { COMPONENT_TYPES } from './constants/warehouseComponents';

// Components
import Dashboard from './components/Dashboard';
import WarehouseMapView from './components/WarehouseMapView';
```

#### After:
```javascript
// Warehouse utilities
import { getComponentColor } from '../lib/warehouse/utils/componentColors';
import { COMPONENT_TYPES } from '../lib/warehouse/constants/warehouseComponents';

// Components (using aliases)
import Dashboard from '@/components/dashboard/WarehouseDashboard';
import MapView from '@/components/warehouse/views/MapView';
```

### File Extensions
- Migrated components now use `.tsx` instead of `.js`
- Better TypeScript support and IDE integration

## Backward Compatibility

### ✅ Preserved Functionality
- Legacy warehouse system still functional
- All existing imports updated automatically
- No breaking changes for core features

### ✅ Gradual Migration
- Can continue using legacy `warehouse/` components
- Modern components available in `components/warehouse/`
- Migration can happen incrementally

## Testing

### Build Validation
```bash
# Check warehouse syntax
cd warehouse && node -c App.js

# Check Next.js build
npm run build
```

### Development Server
```bash
# Start development
npm run dev
```

## Rollback Plan

If issues occur:
1. Stop all processes: `pkill -f "npm run dev"`
2. Restore backup: `cp -r ../WCD-backup-YYYYMMDD ./WCD`
3. Verify: `npm install && npm run dev`

## Next Steps

### Optional Improvements
1. **Complete Component Migration**: Move remaining warehouse components
2. **TypeScript Conversion**: Convert remaining `.js` files to `.tsx`
3. **Hook Extraction**: Extract custom hooks to `hooks/` directory
4. **Service Layer**: Centralize API calls in `lib/services/`

### Recommended Priority
1. **High**: Fix any remaining import issues
2. **Medium**: Migrate frequently used components
3. **Low**: Complete full migration over time

## Support

For issues with the migration:
1. Check this guide first
2. Review `STRUCTURE.md` for current organization
3. Test in development before production
4. Use rollback plan if needed
