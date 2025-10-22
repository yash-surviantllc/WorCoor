import { COMPONENT_COLORS, STORAGE_CATEGORY_COLORS } from '../constants/warehouseComponents';

/**
 * Get the fixed color for a component type
 * @param {string} componentType - The component type
 * @param {string} category - The storage category (optional)
 * @returns {string} - The fixed color hex code
 */
export const getComponentColor = (componentType, category = null) => {
  // For storage units, use category-based colors if available
  if (componentType === 'storage_unit' && category && STORAGE_CATEGORY_COLORS[category]) {
    return STORAGE_CATEGORY_COLORS[category];
  }
  
  const color = COMPONENT_COLORS[componentType] || '#607D8B'; // Default to blue-gray if not found
  
  // Debug log for vertical storage racks
  if (componentType === 'vertical_sku_holder') {
    console.log(`Vertical storage rack color: ${color}`);
  }
  
  return color;
};

/**
 * Apply fixed color to a component item
 * @param {object} item - The component item
 * @returns {object} - The item with fixed color applied
 */
export const applyFixedColor = (item) => {
  return {
    ...item,
    color: getComponentColor(item.type)
  };
};

/**
 * Ensure all items in an array have fixed colors
 * @param {array} items - Array of component items
 * @returns {array} - Items with fixed colors applied
 */
export const ensureFixedColors = (items) => {
  return items.map(applyFixedColor);
};

/**
 * Color coding legend for UI display
 */
export const COLOR_LEGEND = {
  'Floor Plan': {
    'Square Boundary': { color: '#263238', description: 'Main warehouse boundary' }
  },
  'Boundaries': {
    'Solid Boundary': { color: '#607D8B', description: 'Solid zone divisions' },
    'Dotted Boundary': { color: '#90A4AE', description: 'Dotted zone divisions' }
  },
  'Storage Components': {
    'Storage Unit': { color: '#4CAF50', description: 'Storage containers/units' },
    'Horizontal Storage Rack': { color: '#2196F3', description: 'Horizontal storage racks/shelves' },
    'Vertical Storage Rack': { color: '#FF5722', description: 'Vertical storage racks/shelves' }
  },
  'Zone Components': {
    'Warehouse Block': { color: '#FF9800', description: 'Warehouse blocks' },
    'Storage Zone': { color: '#9C27B0', description: 'Storage zones' },
    'Processing Area': { color: '#F44336', description: 'Processing areas' },
    'Container Unit': { color: '#00BCD4', description: 'Container units' },
    'Zone Divider': { color: '#795548', description: 'Zone dividers' },
    'Area Boundary': { color: '#607D8B', description: 'Area boundaries' }
  }
};
