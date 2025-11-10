# Migration to Next.js 15 + React 19 + TypeScript

## Migration Status

### ✅ Completed Steps

1. **Configuration Files Created**
   - ✅ `next.config.js` - Next.js 15 configuration with styled-components support
   - ✅ `tsconfig.json` - TypeScript configuration with path aliases
   - ✅ `next-env.d.ts` - Next.js TypeScript declarations
   - ✅ `.eslintrc.json` - ESLint configuration for Next.js + TypeScript

2. **Package.json Updated**
   - ✅ Updated to Next.js 15.0.3
   - ✅ Updated to React 19.0.0
   - ✅ Updated to React DOM 19.0.0
   - ✅ Added TypeScript 5.3.3
   - ✅ Added all necessary @types packages
   - ✅ Removed react-scripts dependency
   - ✅ Updated scripts for Next.js (dev, build, start, lint)

3. **Next.js App Directory Structure**
   - ✅ `app/layout.tsx` - Root layout with metadata
   - ✅ `app/page.tsx` - Home page wrapping App component

4. **Type Definitions Created**
   - ✅ `src/types/index.ts` - Core type definitions (WarehouseItem, SKU, etc.)
   - ✅ `src/types/constants.ts` - Constants type definitions

### 🔄 In Progress

5. **Installing Dependencies**
   - 🔄 Removing old node_modules
   - ⏳ Fresh npm install pending

### ⏳ Pending Steps

6. **Convert JavaScript Files to TypeScript**
   - ⏳ Convert `src/App.js` to `src/App.tsx`
   - ⏳ Convert all 33 component files (.js → .tsx)
   - ⏳ Convert all 20 utility files (.js → .ts)
   - ⏳ Convert constants file (.js → .ts)
   - ⏳ Convert data files (.js → .ts)

7. **Add Type Annotations**
   - ⏳ Add props interfaces for all components
   - ⏳ Add return type annotations
   - ⏳ Add type annotations for utility functions
   - ⏳ Add type guards where necessary

8. **Update Imports**
   - ⏳ Update all relative imports to use @ path aliases
   - ⏳ Add .tsx/.ts extensions where needed
   - ⏳ Update CSS imports for Next.js

9. **Client/Server Component Directives**
   - ⏳ Add 'use client' to interactive components
   - ⏳ Identify server components (if any)

10. **Testing & Verification**
    - ⏳ Run type checking (npm run type-check)
    - ⏳ Run linting (npm run lint)
    - ⏳ Test dev server (npm run dev)
    - ⏳ Verify all functionality works
    - ⏳ Test build process (npm run build)

## File Conversion Checklist

### Components (33 files)
- [ ] ColorLegend.js → ColorLegend.tsx
- [ ] ComponentPanel.js → ComponentPanel.tsx
- [ ] ContextMenu.js → ContextMenu.tsx
- [ ] Dashboard.js → Dashboard.tsx
- [ ] EnhancedToolbar.js → EnhancedToolbar.tsx
- [ ] FacilityManager.js → FacilityManager.tsx
- [ ] FullscreenMap.js → FullscreenMap.tsx
- [ ] HoverInfoTooltip.js → HoverInfoTooltip.tsx
- [ ] InfoPopup.js → InfoPopup.tsx
- [ ] LocationDetailsPanel.js → LocationDetailsPanel.tsx
- [ ] MainDashboard.js → MainDashboard.tsx
- [ ] MeasurementTools.js → MeasurementTools.tsx
- [ ] MultiLocationSelector.js → MultiLocationSelector.tsx
- [ ] OrgUnitSelector.js → OrgUnitSelector.tsx
- [ ] PopupMessage.js → PopupMessage.tsx
- [ ] PropertiesPanel.js → PropertiesPanel.tsx
- [ ] ResizeHandle.js → ResizeHandle.tsx
- [ ] SavedLayoutRenderer.js → SavedLayoutRenderer.tsx
- [ ] SearchPanel.js → SearchPanel.tsx
- [ ] ShapeLibrary.js → ShapeLibrary.tsx
- [ ] SkuIdSelector.js → SkuIdSelector.tsx
- [ ] StackManager.js → StackManager.tsx
- [ ] Toolbar.js → Toolbar.tsx
- [ ] TopNavbar.js → TopNavbar.tsx
- [ ] WarehouseCanvas.js → WarehouseCanvas.tsx
- [ ] WarehouseDesigner.js → WarehouseDesigner.tsx
- [ ] WarehouseDesignerCanvas.js → WarehouseDesignerCanvas.tsx
- [ ] WarehouseItem.js → WarehouseItem.tsx
- [ ] WarehouseMapView.js → WarehouseMapView.tsx
- [ ] WarehousePalette.js → WarehousePalette.tsx
- [ ] WarehousePropertiesPanel.js → WarehousePropertiesPanel.tsx
- [ ] WarehouseToolbar.js → WarehouseToolbar.tsx
- [ ] ZoneContextMenu.js → ZoneContextMenu.tsx

### Utilities (20 files)
- [ ] batchCreator.js → batchCreator.ts
- [ ] boundaryManager.js → boundaryManager.ts
- [ ] cadImport.js → cadImport.ts
- [ ] componentColors.js → componentColors.ts
- [ ] componentLabeling.js → componentLabeling.ts
- [ ] dataRefresh.js → dataRefresh.ts
- [ ] exportUtils.js → exportUtils.ts
- [ ] facilityHierarchy.js → facilityHierarchy.ts
- [ ] globalIdCache.js → globalIdCache.ts
- [ ] hierarchicalContainer.js → hierarchicalContainer.ts
- [ ] layoutComponentSummary.js → layoutComponentSummary.ts
- [ ] layoutCropper.js → layoutCropper.ts
- [ ] linkingUtils.js → linkingUtils.ts
- [ ] locationService.js → locationService.ts
- [ ] locationUtils.js → locationUtils.ts
- [ ] measurementTools.js → measurementTools.ts
- [ ] shapeCreator.js → shapeCreator.ts
- [ ] shapeRenderer.js → shapeRenderer.ts
- [ ] showMessage.js → showMessage.ts
- [ ] verticalRackUtils.js → verticalRackUtils.ts

### Constants & Data
- [ ] constants/warehouseComponents.js → constants/warehouseComponents.ts
- [ ] data/* files

### Core Files
- [ ] src/App.js → src/App.tsx
- [ ] src/index.js → Not needed (replaced by app/page.tsx)
- [ ] src/index.css → Keep as is (imported in app/layout.tsx)

## Notes

- All components will need 'use client' directive since they use hooks and interactivity
- Path aliases configured: @/components/*, @/utils/*, @/data/*, @/constants/*
- TypeScript strict mode is enabled but with noImplicitAny: false for gradual migration
- Styled-components compiler enabled in next.config.js
- React 19 features available but not required for initial migration

## Next Actions

1. Wait for node_modules cleanup to complete
2. Run fresh npm install
3. Begin systematic file conversion starting with utilities (no dependencies)
4. Then convert components (depend on utilities)
5. Finally convert App.tsx (depends on everything)
6. Test and verify functionality
