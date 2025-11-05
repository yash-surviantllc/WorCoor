import locationData from '../data/layoutComponentsMock.json';

/**
 * Service for fetching location and SKU data from layoutComponentsMock.json
 */
class LocationDataService {
  constructor() {
    this.data = locationData.locations || [];
    this.dataMap = new Map();
    this.dataMapLowerCase = new Map();
    
    // Create maps for quick lookup by location_id (both exact and case-insensitive)
    this.data.forEach(location => {
      if (location.location_id) {
        this.dataMap.set(location.location_id, location);
        this.dataMapLowerCase.set(location.location_id.toLowerCase(), location);
      }
    });
  }

  /**
   * Get location data by location ID (case-insensitive)
   * @param {string} locationId - The location ID (e.g., "Loc-001", "LOC-001", "loc-001")
   * @returns {object|null} Location data or null if not found
   */
  getLocationById(locationId) {
    if (!locationId) return null;
    
    // Try exact match first
    let result = this.dataMap.get(locationId);
    if (result) return result;
    
    // Try case-insensitive match
    result = this.dataMapLowerCase.get(locationId.toLowerCase());
    return result || null;
  }

  /**
   * Get multiple locations by their IDs
   * @param {string[]} locationIds - Array of location IDs
   * @returns {object[]} Array of location data objects
   */
  getLocationsByIds(locationIds) {
    if (!Array.isArray(locationIds)) return [];
    return locationIds
      .map(id => this.getLocationById(id))
      .filter(location => location !== null);
  }

  /**
   * Search locations by SKU name, code, or vendor
   * @param {string} query - Search query
   * @returns {object[]} Array of matching location data
   */
  searchLocations(query) {
    if (!query) return [];
    const searchTerm = query.toLowerCase();
    
    return this.data.filter(location => 
      (location.sku_name && location.sku_name.toLowerCase().includes(searchTerm)) ||
      (location.sku_code && location.sku_code.toLowerCase().includes(searchTerm)) ||
      (location.sku_brand_vendor && location.sku_brand_vendor.toLowerCase().includes(searchTerm)) ||
      (location.location_id && location.location_id.toLowerCase().includes(searchTerm))
    );
  }

  /**
   * Get all locations
   * @returns {object[]} All location data
   */
  getAllLocations() {
    return [...this.data];
  }

  /**
   * Get locations by parent resource type
   * @param {string} resourceType - Parent resource (e.g., "Pallets", "Shelving")
   * @returns {object[]} Array of matching locations
   */
  getLocationsByResource(resourceType) {
    if (!resourceType) return [];
    return this.data.filter(location => 
      location.parent_resource === resourceType
    );
  }

  /**
   * Get summary statistics
   * @returns {object} Summary statistics
   */
  getSummaryStats() {
    const totalLocations = this.data.length;
    const totalQuantity = this.data.reduce((sum, loc) => sum + (loc.available_quantity || 0), 0);
    const uniqueVendors = new Set(this.data.map(loc => loc.sku_brand_vendor)).size;
    const resourceTypes = {};
    
    this.data.forEach(loc => {
      const resource = loc.parent_resource || 'Unknown';
      resourceTypes[resource] = (resourceTypes[resource] || 0) + 1;
    });

    return {
      totalLocations,
      totalQuantity,
      uniqueVendors,
      resourceTypes
    };
  }
}

// Export singleton instance
const locationDataService = new LocationDataService();

// Log initialization for debugging
console.log('LocationDataService initialized with', locationDataService.data.length, 'locations');
console.log('Sample location IDs:', locationDataService.data.slice(0, 5).map(loc => loc.location_id));

export default locationDataService;
