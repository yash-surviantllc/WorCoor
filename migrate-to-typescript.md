# TypeScript Migration Guide

## Automated Migration Steps

Due to the large number of files (53+ files), I recommend the following systematic approach:

### Phase 1: Install Dependencies (IN PROGRESS)
```bash
npm install
```

### Phase 2: Convert Utility Files (No UI Dependencies)
These files can be converted independently:

1. **Simple Utilities** (No dependencies):
   - ✅ showMessage.ts (DONE)
   - globalIdCache.js → globalIdCache.ts
   - componentColors.js → componentColors.ts
   - componentLabeling.js → componentLabeling.ts

2. **Complex Utilities** (Have dependencies):
   - locationUtils.js → locationUtils.ts
   - dataRefresh.js → dataRefresh.ts
   - boundaryManager.js → boundaryManager.ts
   - hierarchicalContainer.js → hierarchicalContainer.ts
   - batchCreator.js → batchCreator.ts
   - shapeRenderer.js → shapeRenderer.ts
   - shapeCreator.js → shapeCreator.ts
   - facilityHierarchy.js → facilityHierarchy.ts
   - measurementTools.js → measurementTools.ts
   - exportUtils.js → exportUtils.ts
   - cadImport.js → cadImport.ts
   - layoutCropper.js → layoutCropper.ts
   - layoutComponentSummary.js → layoutComponentSummary.ts
   - linkingUtils.js → linkingUtils.ts
   - locationService.js → locationService.ts
   - verticalRackUtils.js → verticalRackUtils.ts

### Phase 3: Convert Constants & Data
- constants/warehouseComponents.js → constants/warehouseComponents.ts
- data/* files

### Phase 4: Convert Simple Components
Components with minimal dependencies:
- PopupMessage.js → PopupMessage.tsx (needed by showMessage)
- ColorLegend.js → ColorLegend.tsx
- HoverInfoTooltip.js → HoverInfoTooltip.tsx
- ResizeHandle.js → ResizeHandle.tsx
- InfoPopup.js → InfoPopup.tsx

### Phase 5: Convert Complex Components
Components with many dependencies:
- WarehouseItem.js → WarehouseItem.tsx
- ComponentPanel.js → ComponentPanel.tsx
- PropertiesPanel.js → PropertiesPanel.tsx
- WarehouseCanvas.js → WarehouseCanvas.tsx
- Toolbar.js → Toolbar.tsx
- TopNavbar.js → TopNavbar.tsx
- ContextMenu.js → ContextMenu.tsx
- StackManager.js → StackManager.tsx
- SearchPanel.js → SearchPanel.tsx
- Dashboard.js → Dashboard.tsx
- MainDashboard.js → MainDashboard.tsx
- FacilityManager.js → FacilityManager.tsx
- MeasurementTools.js → MeasurementTools.tsx
- EnhancedToolbar.js → EnhancedToolbar.tsx
- FullscreenMap.js → FullscreenMap.tsx
- LocationDetailsPanel.js → LocationDetailsPanel.tsx
- MultiLocationSelector.js → MultiLocationSelector.tsx
- OrgUnitSelector.js → OrgUnitSelector.tsx
- SavedLayoutRenderer.js → SavedLayoutRenderer.tsx
- ShapeLibrary.js → ShapeLibrary.tsx
- SkuIdSelector.js → SkuIdSelector.tsx
- WarehouseDesigner.js → WarehouseDesigner.tsx
- WarehouseDesignerCanvas.js → WarehouseDesignerCanvas.tsx
- WarehouseMapView.js → WarehouseMapView.tsx
- WarehousePalette.js → WarehousePalette.tsx
- WarehousePropertiesPanel.js → WarehousePropertiesPanel.tsx
- WarehouseToolbar.js → WarehouseToolbar.tsx
- ZoneContextMenu.js → ZoneContextMenu.tsx

### Phase 6: Convert Main App
- src/App.js → src/App.tsx

### Phase 7: Add 'use client' Directives
All interactive components need 'use client' at the top:
```typescript
'use client';

import React from 'react';
// ... rest of imports
```

### Phase 8: Testing
1. Run type check: `npm run type-check`
2. Run lint: `npm run lint`
3. Start dev server: `npm run dev`
4. Test all functionality
5. Build: `npm run build`

## Key TypeScript Patterns

### Component Props Interface
```typescript
interface ComponentNameProps {
  prop1: string;
  prop2?: number; // optional
  onAction: (value: string) => void;
  children?: React.ReactNode;
}

const ComponentName: React.FC<ComponentNameProps> = ({ prop1, prop2, onAction }) => {
  // component code
};
```

### State with Types
```typescript
const [items, setItems] = useState<WarehouseItem[]>([]);
const [selected, setSelected] = useState<string | null>(null);
```

### Event Handlers
```typescript
const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
  // handler code
};

const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
  // handler code
};
```

### Utility Functions
```typescript
export const utilityFunction = (param1: string, param2: number): ReturnType => {
  // function code
  return result;
};
```

## Important Notes

1. **Keep .js files**: Don't delete .js files until .ts/.tsx versions are tested
2. **Gradual migration**: Convert and test in phases
3. **Type safety**: Start with `any` types if needed, refine later
4. **Import paths**: Use @ aliases: `@/components/*`, `@/utils/*`
5. **CSS imports**: Keep as-is, Next.js handles them
6. **'use client'**: Add to all components using hooks, state, or browser APIs

## After Migration

1. Delete all .js files once .ts/.tsx versions are verified
2. Update imports in any remaining .js files
3. Run full test suite
4. Update documentation
5. Commit changes with clear message: "Migrate to Next.js 15 + React 19 + TypeScript"
