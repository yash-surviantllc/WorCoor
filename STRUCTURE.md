# Project Structure

## Modern Next.js App (app/)
- **dashboard/**: Main dashboard application
  - **admin/**: Admin functions (roles, users, settings)
  - **warehouse-management/**: Warehouse operations
    - **layout-builder/**: Layout designer
    - **warehouse-map/**: Interactive maps
  - **product-manager/**: Product management
  - **reference-data/**: Reference data management
    - **_components/**: Shared components
    - **_hooks/**: Custom hooks
    - **_types/**: TypeScript definitions
    - **skus/**: SKU data
    - **org-units/**: Organizational units
    - **location-tags/**: Location identifiers
    - **asset-management/**: Asset tracking

## Components (components/)
- **ui/**: Base UI components (Radix UI)
- **dashboard/**: Dashboard-specific components
  - **WarehouseDashboard.tsx**: Warehouse dashboard
  - **MainDashboard.tsx**: Main dashboard view
- **warehouse/**: Modern warehouse components
  - **views/**: View components
    - **MapView.tsx**: Interactive map view
    - **FullscreenView.tsx**: Fullscreen map
  - **forms/**: Form components
    - **SkuIdSelector.tsx**: SKU selection
    - **MultiLocationSelector.tsx**: Multi-location selection
  - **tools/**: Tool components
    - **MeasurementTools.tsx**: Measurement tools
    - **SearchPanel.tsx**: Search functionality
    - **PopupMessage.tsx**: Message popups

## Libraries (lib/)
- **warehouse/**: Warehouse-specific logic
  - **constants/**: Component definitions
    - **warehouseComponents.js**: Warehouse component types
  - **utils/**: Utility functions
    - **componentColors.js**: Color management
    - **componentLabeling.js**: Label system
    - **boundaryManager.js**: Boundary management
    - **dataRefresh.js**: Data refresh
    - **exportUtils.js**: Export utilities
    - **layoutCropper.js**: Layout cropping
    - **locationUtils.js**: Location utilities
    - **measurementTools.js**: Measurement tools
    - **shapeCreator.js**: Shape creation
    - **showMessage.js**: Message system

## Legacy Warehouse (warehouse/)
- **components/**: Remaining warehouse components (34 items)
- **integration/**: Integration wrappers
- **services/**: Legacy services
- **data/**: Mock data

## Source Utilities (src/)
- **utils/**: Authentication and utilities
- **services/**: API services
- **constants/**: API endpoints

## Path Aliases
- **@/components***: Modern component imports
- **@/lib***: Library and utility imports
- **@/src***: Source utilities
- **@/***: Root-relative imports

## Migration Status
✅ **Phase 1**: Analysis & Backup complete
✅ **Phase 2**: Utility consolidation complete
✅ **Phase 3**: Component migration partial
✅ **Phase 4**: Reference data organization complete
✅ **Phase 5**: Import path updates complete
✅ **Phase 6**: Testing & validation complete
✅ **Phase 7**: Cleanup complete
