// Type declarations for warehouse components to resolve TypeScript errors

declare module 'prop-types' {
  export interface InferProps<T> {
    [K in keyof T]: any;
  }
  export interface ReactElementLike {
    type: any;
    props: any;
    key: any;
  }
  export interface ReactNodeArray extends Array<ReactNodeLike> {}
  export type ReactNodeLike = ReactElementLike | string | number | boolean | null | undefined | ReactNodeArray;
  export interface ReactElement {
    type: any;
    props: any;
    key: string | number;
  }
  export const element: any;
  export const node: any;
  export const bool: any;
  export const string: any;
  export const number: any;
  export const func: any;
  export const object: any;
  export const oneOf: any;
  export const oneOfType: any;
  export const arrayOf: any;
  export const shape: any;
  export const instanceOf: any;
}

// Common warehouse component types
export interface WarehouseItem {
  id: string;
  type: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color?: string;
  backgroundColor?: string;
  isHollow?: boolean;
  showCompartments?: boolean;
  locationId?: string;
  locationTag?: string;
  label?: string;
  occupancyStatus?: string;
  storageOrientation?: string;
  category?: string;
  isPositionLocked?: boolean;
  isSizeLocked?: boolean;
  skuGrid?: any;
  inventory?: any;
  metadata?: any;
}

export interface OrgUnit {
  id: string;
  name: string;
  location?: string;
}

export interface LayoutData {
  name: string;
  items: WarehouseItem[];
  operationalStatus?: string;
  timestamp?: string;
  version?: string;
  orgUnit?: string | OrgUnit;
  orgMap?: any;
  metadata?: any;
}

// Event handler types
export interface MouseEventLike {
  nativeEvent: {
    pageX: number;
    pageY: number;
    clientX: number;
    clientY: number;
  };
  clientX: number;
  clientY: number;
  pageX: number;
  pageY: number;
  target: HTMLElement;
  preventDefault: () => void;
  stopPropagation: () => void;
}

export interface DraggedItem {
  type: string;
  name: string;
  icon: string;
  defaultSize: { width: number; height: number };
  category?: string;
  color?: string;
}

// Canvas and component state types
export interface CanvasState {
  isDragging: boolean;
  isOver: boolean;
  canDrop: boolean;
  connectionPreview: any;
  isLinkingMode: boolean;
  drawingMode: any;
  isDrawing: boolean;
  drawingStart: any;
  drawingPreview: any;
  selectionBox: any;
  selectedItems: string[];
}

// Generic function types
export type EventHandler<T = any> = (event: T) => void;
export type Callback<T = any> = (value: T) => void;
export type UpdateCallback<T = any> = (id: string, updates: Partial<T>) => void;
