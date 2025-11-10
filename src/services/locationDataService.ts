import locationData from '../data/layoutComponentsMock.json';

/**
 * Location data interface
 */
interface LocationData {
  location_id: string;
  sku_name?: string;
  sku_code?: string;
  sku_brand_vendor?: string;
  parent_resource?: string;
  available_quantity?: number;
  [key: string]: any;
}

/**
 * Summary statistics interface
 */
interface SummaryStats {
  totalLocations: number;
  totalQuantity: number;
  uniqueVendors: number;
  resourceTypes: Record<string, number>;
}

/**
 * Location data JSON structure
 */
interface LocationDataJSON {
  locations?: LocationData[];
}

/**
 * Service for fetching location and SKU data from layoutComponentsMock.json
 */
class LocationDataService {
  private data: LocationData[];
  private dataMap: Map<string, LocationData>;
  private dataMapLowerCase: Map<string, LocationData>;

  constructor() {
    const jsonData = locationData as LocationDataJSON;
    this.data = jsonData.locations || [];
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
   * @param locationId - The location ID (e.g., "Loc-001", "LOC-001", "loc-001")
   * @returns Location data or null if not found
   */
  getLocationById(locationId: string): LocationData | null {
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
   * @param locationIds - Array of location IDs
   * @returns Array of location data objects
   */
  getLocationsByIds(locationIds: string[]): LocationData[] {
    if (!Array.isArray(locationIds)) return [];
    return locationIds
      .map(id => this.getLocationById(id))
      .filter((location): location is LocationData => location !== null);
  }

  /**
   * Search locations by SKU name, code, or vendor
   * @param query - Search query
   * @returns Array of matching location data
   */
  searchLocations(query: string): LocationData[] {
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
   * @returns All location data
   */
  getAllLocations(): LocationData[] {
    return [...this.data];
  }

  /**
   * Get locations by parent resource type
   * @param resourceType - Parent resource (e.g., "Pallets", "Shelving")
   * @returns Array of matching locations
   */
  getLocationsByResource(resourceType: string): LocationData[] {
    if (!resourceType) return [];
    return this.data.filter(location => 
      location.parent_resource === resourceType
    );
  }

  /**
   * Get summary statistics
   * @returns Summary statistics
   */
  getSummaryStats(): SummaryStats {
    const totalLocations = this.data.length;
    const totalQuantity = this.data.reduce((sum, loc) => sum + (loc.available_quantity || 0), 0);
    const uniqueVendors = new Set(this.data.map(loc => loc.sku_brand_vendor)).size;
    const resourceTypes: Record<string, number> = {};
    
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
console.log('LocationDataService initialized with', locationDataService.getAllLocations().length, 'locations');
console.log('Sample location IDs:', locationDataService.getAllLocations().slice(0, 5).map(loc => loc.location_id));

export default locationDataService;
