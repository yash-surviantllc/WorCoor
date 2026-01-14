// Warehouse Type Definitions

export interface FacilityData {
  name: string;
  description: string;
  areas: Array<{
    id: string;
    name: string;
    type: string;
  }>;
  zones: Array<{
    id: string;
    name: string;
    type: string;
    color: string;
  }>;
}

export interface WarehouseItem {
  id: string;
  name: string;
  type: string;
  locationId?: string;
  primaryLocationId?: string;
  locationIds?: string[];
  sku?: string;
  uniqueId?: string;
  primarySku?: string;
  levelLocationMappings?: Record<string, any>;
  levelIds?: Record<string, any>;
  compartmentContents?: Record<string, any>;
  layoutData?: any;
  inventoryData?: {
    capacity?: number;
    utilization?: number;
    inventory?: any[];
    lastActivity?: string;
  };
  [key: string]: any;
}

export interface MainDashboardProps {
  onNavigateToBuilder: () => void;
}

// More flexible type definitions for dynamic data
export type SearchResults = any[];
export type LocationTag = any;
export type SKU = any;
export type Asset = any;
export type UnitData = any;
export type ZoneData = any;
export type OperationalData = any;

// Component Type Definitions
export const COMPONENT_TYPES = {
  STORAGE_UNIT: 'storage_unit',
  SPARE_UNIT: 'spare_unit',
  SKU_HOLDER: 'sku_holder',
  VERTICAL_SKU_HOLDER: 'vertical_sku_holder',
  SOLID_BOUNDARY: 'solid_boundary',
  DOTTED_BOUNDARY: 'dotted_boundary',
  SQUARE_BOUNDARY: 'square_boundary',
  WAREHOUSE_BLOCK: 'warehouse_block',
  STORAGE_ZONE: 'storage_zone',
  PROCESSING_AREA: 'processing_area',
  CONTAINER_UNIT: 'container_unit',
  ZONE_DIVIDER: 'zone_divider',
  AREA_BOUNDARY: 'area_boundary'
} as const;

export type ComponentType = typeof COMPONENT_TYPES[keyof typeof COMPONENT_TYPES];

// Status Colors
export const STATUS_COLORS = {
  EMPTY: '#4CAF50',
  OCCUPIED: '#F44336',
  RESERVED: '#FF9800',
  MAINTENANCE: '#9C27B0',
  DAMAGED: '#795548'
} as const;

export const ORIENTATION_COLORS = {
  HORIZONTAL: '#2196F3',
  VERTICAL: '#FF5722',
  GRID: '#607D8B'
} as const;
